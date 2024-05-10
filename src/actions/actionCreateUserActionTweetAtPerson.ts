'use server'
import 'server-only'

import { User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { nativeEnum, object, string, z } from 'zod'

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
import { generateReferralId } from '@/utils/shared/referralId'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'

const logger = getLogger(`actionCreateUserActionTweetedAtPerson`)

const createActionTweetAtPersonInputValidationSchema = object({
  campaignName: nativeEnum(UserActionTweetAtPersonCampaignName),
  dtsiSlug: string().nullable(),
})

export type CreateActionTweetAtPersonInput = z.infer<
  typeof createActionTweetAtPersonInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionTweetedAtPerson = withServerActionMiddleware(
  'actionCreateUserActionTweetedAtPerson',
  _actionCreateUserActionTweetedAtPerson,
)

type CampaignDuration = {
  START_TIME: Date | null
  END_TIME: Date | null
}

const CAMPAIGN_DURATION: Record<UserActionTweetAtPersonCampaignName, CampaignDuration> = {
  [UserActionTweetAtPersonCampaignName['DEFAULT']]: {
    START_TIME: null,
    END_TIME: null,
  },
  [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: {
    START_TIME: new Date('2024-05-19'),
    END_TIME: new Date('2024-05-22'),
  },
}

async function _actionCreateUserActionTweetedAtPerson(input: CreateActionTweetAtPersonInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionTweetAtPersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  if (
    !process.env.NEXT_PUBLIC_BYPASS_TWEETED_AT_PERSON_CAMPAIGN_DURATION_CHECK &&
    NEXT_PUBLIC_ENVIRONMENT === 'production'
  ) {
    const currentTime = Date.now()
    const campaignDuration = CAMPAIGN_DURATION[validatedInput.data.campaignName]

    if (campaignDuration.START_TIME && currentTime < campaignDuration.START_TIME.getTime()) {
      return {
        errors: {
          campaignName: ['This campaign is not live yet.'],
        },
      }
    }
    if (campaignDuration.END_TIME && currentTime > campaignDuration.END_TIME.getTime()) {
      return {
        errors: {
          campaignName: ['This campaign is no longer live.'],
        },
      }
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: { include: { primaryUserCryptoAddress: true, address: true } },
  })

  let user = userMatch.user
  if (!user) {
    await triggerRateLimiterAtMostOnce()
    user = await createUser({ localUser, sessionId })
  }

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
      sharedDependencies: { analytics },
    })
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction } = await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFT(userAction, user.primaryUserCryptoAddress)
  }

  return { user: getClientUser(user) }
}

async function createUser(sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId'>) {
  const { localUser, sessionId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      hasRepliedToOptInSms: false,
      referralId: generateReferralId(),
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
  validatedInput: z.SafeParseSuccess<CreateActionTweetAtPersonInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.TWEET_AT_PERSON,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

async function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionTweetAtPersonInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  await sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.TWEET_AT_PERSON,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
  })
}

async function createAction<U extends User>({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
  isNewUser,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionTweetAtPersonInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.TWEET_AT_PERSON,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionTweetAtPerson: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
        },
      },
    },
    include: {
      userActionTweetAtPerson: true,
    },
  })

  logger.info('created user action')

  await sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.TWEET_AT_PERSON,
    campaignName: validatedInput.campaignName,
    userState: isNewUser ? 'New' : 'Existing',
  })

  return { userAction }
}
