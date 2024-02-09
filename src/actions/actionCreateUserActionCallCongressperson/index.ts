'use server'
import 'server-only'

import {
  UserAndMethodOfMatch,
  getMaybeUserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { getLogger } from '@/utils/shared/logger'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { User, UserAction, UserActionType, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'

import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { nativeEnum, object } from 'zod'
import { claimNFT } from '@/utils/server/nft/claimNFT'

const createActionCallCongresspersonInputValidationSchema = object({
  address: zodAddress,
  campaignName: nativeEnum(UserActionCallCampaignName),
  dtsiSlug: zodDTSISlug,
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
})

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
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

  const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  await throwIfRateLimited()

  const user = userMatch.user || (await createUser({ localUser, sessionId }))

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    localUser,
    userId: user.id,
  })

  const recentUserAction = await getRecentUserActionByUserId(user.id)
  if (recentUserAction) {
    logSpamActionSubmissions({
      sharedDependencies: { analytics },
      userAction: recentUserAction,
      userId: user.id,
      validatedInput,
    })
    return { user: getClientUser(user) }
  }

  const { userAction, updatedUser } = await createActionAndUpdateUser({
    isNewUser: !userMatch.user,
    sharedDependencies: { analytics, peopleAnalytics, sessionId },
    user,
    userMatch,
    validatedInput: validatedInput.data,
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
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
    include: {
      primaryUserCryptoAddress: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    getServerPeopleAnalytics({ localUser, userId: createdUser.id }).setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }

  return createdUser
}

async function getRecentUserActionByUserId(userId: User['id']) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.CALL,
      campaignName: UserActionCallCampaignName.DEFAULT,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  userAction,
  userId,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<
    z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  >
  userAction: UserAction
  userId: User['id']
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.CALL,
    campaignName: UserActionCallCampaignName.DEFAULT,
    reason: 'Too Many Recent',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.CALL} user action for campaign ${UserActionCallCampaignName.DEFAULT} submitted`,
    {
      extra: { userAction, validatedInput: validatedInput.data },
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
  validatedInput: z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      user: { connect: { id: user.id } },
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionCall: {
        create: {
          address: {
            connectOrCreate: {
              create: validatedInput.address,
              where: { googlePlaceId: validatedInput.address.googlePlaceId },
            },
          },
          recipientDtsiSlug: validatedInput.dtsiSlug,
          recipientPhoneNumber: validatedInput.phoneNumber,
        },
      },
    },
    include: {
      userActionCall: true,
    },
  })

  const updatedUser = await prismaClient.user.update({
    data: {
      address: {
        connect: {
          id: userAction.userActionCall!.addressId,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
    },
    where: { id: user.id },
  })
  logger.info('created user action and updated user')

  sharedDependencies.analytics.trackUserActionCreated({
    'Recipient DTSI Slug': validatedInput.dtsiSlug,
    'Recipient Phone Number': validatedInput.phoneNumber,
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
    ...convertAddressToAnalyticsProperties(validatedInput.address),
    userState: isNewUser ? 'New' : 'Existing',
  })
  sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { updatedUser, userAction }
}
