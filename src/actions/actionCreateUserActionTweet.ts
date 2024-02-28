'use server'
import 'server-only'

import {
  Address,
  User,
  UserActionType,
  UserCryptoAddress,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
  ServerLocalUser,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { UserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns'

const logger = getLogger(`actionCreateUserActionTweet`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  address: Address | null
}

export const actionCreateUserActionTweet = withServerActionMiddleware(
  'actionCreateUserActionTweet',
  _actionCreateUserActionTweet,
)

async function _actionCreateUserActionTweet() {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, address: true },
    },
  })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionId()
  const localUser = parseLocalUserFromCookies()

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    sessionId,
    localUser,
  })
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  if (localUser) {
    await peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')
  const campaignName = UserActionTweetCampaignName.DEFAULT
  const actionType = UserActionType.TWEET
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
  })

  if (userAction) {
    await analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState,
    })
    Sentry.captureMessage(
      `duplicate ${actionType} user action for campaign ${campaignName} submitted`,
      { extra: { userAction }, user: { id: user.id } },
    )
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
    },
  })
  await analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState,
  })

  logger.info('created action')
  return { user: getClientUser(user) }
}

async function maybeUpsertUser({
  existingUser,
  sessionId,
  localUser,
}: {
  existingUser: UserWithRelations | null
  sessionId: string
  localUser: ServerLocalUser | null
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  if (existingUser) {
    return { user: existingUser, userState: 'Existing' }
  }
  const user = await prismaClient.user.create({
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
    data: {
      ...mapLocalUserToUserDatabaseFields(localUser),
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
    },
  })
  return { user, userState: 'New' }
}
