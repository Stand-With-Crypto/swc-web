'use server'
import 'server-only'

import { User, UserActionType } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { getLogger } from '@/utils/shared/logger'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionVoterAttestationCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodUsaState } from '@/validation/fields/zodUsaState'

const createActionVoterAttestationInputValidationSchema = object({
  campaignName: nativeEnum(UserActionVoterAttestationCampaignName),
  stateCode: zodUsaState,
  address: zodAddress,
})

export type CreateActionVoterAttestationInput = z.infer<
  typeof createActionVoterAttestationInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  hasRegisteredRatelimit: boolean
}

const logger = getLogger(`actionCreateUserActionVoterAttestation`)

export const actionCreateUserActionVoterAttestation = withServerActionMiddleware(
  'actionCreateUserActionVoterAttestation',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionVoterAttestation,
  ),
)

async function _actionCreateUserActionVoterAttestation(input: CreateActionVoterAttestationInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionVoterAttestationInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const recentUserAction = await getRecentUserActionByUserId(user.id, validatedInput)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      sharedDependencies: { analytics },
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction, updatedUser } = await createActionAndUpdateUser({
    user,
    validatedInput: validatedInput.data,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification(userAction, user.primaryUserCryptoAddress)
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(updatedUser) }
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionVoterAttestationInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VOTER_ATTESTATION,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionVoterAttestationInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.VOTER_ATTESTATION,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
}

async function createActionAndUpdateUser<U extends User>({
  user,
  validatedInput,
  sharedDependencies,
}: {
  user: U
  validatedInput: CreateActionVoterAttestationInput
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.VOTER_ATTESTATION,
      campaignName: validatedInput.campaignName,
      ...(user.primaryUserCryptoAddressId
        ? {
            userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionVoterAttestation: {
        create: {
          usaState: validatedInput.stateCode,
        },
      },
    },
    include: {
      userActionVoterAttestation: true,
    },
  })

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      address: {
        connectOrCreate: {
          where: { googlePlaceId: validatedInput.address.googlePlaceId },
          create: validatedInput.address,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user action and updated user')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.VOTER_ATTESTATION,
    campaignName: validatedInput.campaignName,
    'USA State': validatedInput.stateCode,
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })
  sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { userAction, updatedUser }
}
