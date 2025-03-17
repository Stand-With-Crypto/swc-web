'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getCountryCodeCookie } from '@/utils/server/getCountryCodeCookie'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionVoterAttestationCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodUsaState } from '@/validation/fields/zodUsaState'

const createActionVoterAttestationInputValidationSchema = object({
  campaignName: nativeEnum(UserActionVoterAttestationCampaignName),
  stateCode: zodUsaState,
  address: zodAddress,
  shouldBypassAuth: z.boolean().optional(),
})

export type CreateActionVoterAttestationInput = z.infer<
  typeof createActionVoterAttestationInputValidationSchema
>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  countryCode: string
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  hasRegisteredRatelimit: boolean
  isNewUser: boolean
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

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const countryCode = await getCountryCodeCookie()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, address: true },
    },
  })
  const shouldBypassAuth = validatedInput.data.shouldBypassAuth

  if (!userMatch.user && !shouldBypassAuth) {
    throw new Error('Unauthenticated')
  }

  const user =
    userMatch.user ||
    (await createUser({
      localUser,
      sessionId,
      address: validatedInput.data.address,
      countryCode,
    }))
  const isNewUser = !userMatch.user

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
    const shouldUpdateAddress =
      validatedInput.data.address.formattedDescription !== user?.address?.formattedDescription
    if (shouldUpdateAddress) {
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.data.address.googlePlaceId },
              create: validatedInput.data.address,
            },
          },
        },
      })
      logger.info('updated user address')
    }

    logSpamActionSubmissions({
      validatedInput,
      sharedDependencies: { analytics, isNewUser },
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction, updatedUser } = await createActionAndUpdateUser({
    user,
    validatedInput: validatedInput.data,
    sharedDependencies: { sessionId, analytics, peopleAnalytics, isNewUser, countryCode },
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
  sharedDependencies: Pick<SharedDependencies, 'analytics' | 'isNewUser'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.VOTER_ATTESTATION,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: sharedDependencies.isNewUser ? 'New' : 'Existing',
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
  sharedDependencies: Pick<
    SharedDependencies,
    'sessionId' | 'analytics' | 'peopleAnalytics' | 'isNewUser' | 'countryCode'
  >
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      countryCode: sharedDependencies.countryCode,
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
    userState: sharedDependencies.isNewUser ? 'New' : 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })
  sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { userAction, updatedUser }
}

async function createUser({
  localUser,
  sessionId,
  address,
  countryCode,
}: {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  address?: z.infer<typeof zodAddress>
  countryCode: string
}) {
  const createdUser = await prismaClient.user.create({
    data: {
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      ...(address
        ? {
            address: {
              connectOrCreate: {
                where: { googlePlaceId: address.googlePlaceId },
                create: address,
              },
            },
          }
        : {}),
      ...mapLocalUserToUserDatabaseFields(localUser),
      countryCode,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    waitUntil(
      getServerPeopleAnalytics({ localUser, userId: createdUser.id })
        .setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        .flush(),
    )
  }

  return createdUser
}
