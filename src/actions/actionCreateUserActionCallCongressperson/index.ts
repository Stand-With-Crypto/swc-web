'use server'
import 'server-only'

import { User, UserAction, UserActionType, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

const createActionCallCongresspersonInputValidationSchema = object({
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
  campaignName: nativeEnum(UserActionCallCampaignName),
  dtsiSlug: zodDTSISlug,
  address: zodAddress,
})

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  hasRegisteredRatelimit: boolean
}

const logger = getLogger(`actionCreateUserActionCallCongressperson`)

export const actionCreateUserActionCallCongressperson = withServerActionMiddleware(
  'actionCreateUserActionCallCongressperson',
  _actionCreateUserActionCallCongressperson,
)

async function _actionCreateUserActionCallCongressperson(
  input: CreateActionCallCongresspersonInput,
) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, address: true },
    },
  })

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }

  const user = userMatch.user || (await createUser({ localUser, sessionId }))

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })

  const recentUserAction = await getRecentUserActionByUserId(user.id, validatedInput)
  if (recentUserAction) {
    await logSpamActionSubmissions({
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
      sharedDependencies: { analytics },
    })
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction, updatedUser } = await createActionAndUpdateUser({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFT(userAction, user.primaryUserCryptoAddress)
  }

  return { user: getClientUser(updatedUser) }
}

async function createUser(sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId'>) {
  const { localUser, sessionId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    await getServerPeopleAnalytics({ localUser, userId: createdUser.id }).setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }

  return createdUser
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionCallCongresspersonInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.CALL,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

async function logSpamActionSubmissions({
  validatedInput,
  userAction,
  userId,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionCallCongresspersonInput>
  userAction: UserAction
  userId: User['id']
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  await sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.CALL} user action for campaign ${validatedInput.data.campaignName} submitted`,
    {
      extra: { validatedInput: validatedInput.data, userAction },
      user: { id: userId },
    },
  )
}

async function createActionAndUpdateUser<U extends User>({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
  isNewUser,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionCallCongresspersonInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionCall: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
          recipientPhoneNumber: validatedInput.phoneNumber,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.address.googlePlaceId },
              create: validatedInput.address,
            },
          },
        },
      },
    },
    include: {
      userActionCall: true,
    },
  })
  const updatedUser = userAction.userActionCall!.addressId
    ? await prismaClient.user.update({
        where: { id: user.id },
        data: {
          address: {
            connect: {
              id: userAction.userActionCall!.addressId,
            },
          },
        },
        include: {
          primaryUserCryptoAddress: true,
          address: true,
        },
      })
    : user
  logger.info('created user action and updated user')

  await sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
    'Recipient DTSI Slug': validatedInput.dtsiSlug,
    'Recipient Phone Number': validatedInput.phoneNumber,
    ...convertAddressToAnalyticsProperties(validatedInput.address),
    userState: isNewUser ? 'New' : 'Existing',
  })
  await sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { userAction, updatedUser }
}
