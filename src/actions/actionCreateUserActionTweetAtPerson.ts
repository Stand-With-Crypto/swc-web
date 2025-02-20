'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { isAfter, isBefore } from 'date-fns'
import { nativeEnum, object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getTenantId } from '@/utils/server/getTenantId'
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
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toBool } from '@/utils/shared/toBool'
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
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
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
    END_TIME: new Date('2024-05-24'),
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
    toBool(!process.env.NEXT_PUBLIC_BYPASS_TWEETED_AT_PERSON_CAMPAIGN_DURATION_CHECK) &&
    NEXT_PUBLIC_ENVIRONMENT === 'production'
  ) {
    const currentTime = Date.now()
    const campaignDuration = CAMPAIGN_DURATION[validatedInput.data.campaignName]

    if (
      campaignDuration.START_TIME &&
      isBefore(currentTime, campaignDuration.START_TIME.getTime())
    ) {
      return {
        errors: {
          campaignName: ['This campaign is not live yet.'],
        },
      }
    }
    if (campaignDuration.END_TIME && isAfter(currentTime, campaignDuration.END_TIME.getTime())) {
      return {
        errors: {
          campaignName: ['This campaign is no longer live.'],
        },
      }
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const tenantId = await getTenantId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: { include: { primaryUserCryptoAddress: true, address: true } },
  })

  let user = userMatch.user
  if (!user) {
    await triggerRateLimiterAtMostOnce()
    user = await createUser({ localUser, sessionId, tenantId })
  }

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
  const { userAction } = await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
    tenantId,
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification(userAction, user.primaryUserCryptoAddress)
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId'> & { tenantId: string },
) {
  const { localUser, sessionId, tenantId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      referralId: generateReferralId(),
      ...mapLocalUserToUserDatabaseFields(localUser),
      tenantId,
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

function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionTweetAtPersonInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
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
  tenantId,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionTweetAtPersonInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  tenantId: string
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.TWEET_AT_PERSON,
      tenantId,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionTweetAtPerson: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
          tenantId,
        },
      },
    },
    include: {
      userActionTweetAtPerson: true,
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.TWEET_AT_PERSON,
    campaignName: validatedInput.campaignName,
    userState: isNewUser ? 'New' : 'Existing',
  })

  return { userAction }
}
