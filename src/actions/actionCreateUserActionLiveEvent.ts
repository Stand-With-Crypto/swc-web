'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
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
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const logger = getLogger(`actionCreateUserActionLiveEvent`)

const createActionLiveEventInputValidationSchema = object({
  campaignName: nativeEnum(USUserActionLiveEventCampaignName),
})

export type CreateActionLiveEventInput = z.infer<typeof createActionLiveEventInputValidationSchema>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionLiveEvent = withServerActionMiddleware(
  'actionCreateUserActionLiveEvent',
  _actionCreateUserActionLiveEvent,
)

type EventDuration = {
  START_TIME: Date
  END_TIME: Date
}

const EVENT_DURATION: Record<USUserActionLiveEventCampaignName, EventDuration> = {
  [USUserActionLiveEventCampaignName['2024_03_04_LA']]: {
    START_TIME: new Date('2024-03-04'),
    END_TIME: new Date('2024-03-06'),
  },
}

async function _actionCreateUserActionLiveEvent(input: CreateActionLiveEventInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionLiveEventInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  if (
    !process.env.NEXT_PUBLIC_BYPASS_LIVE_EVENT_DURATION_CHECK &&
    NEXT_PUBLIC_ENVIRONMENT === 'production'
  ) {
    const currentTime = Date.now()
    const eventDuration = EVENT_DURATION[validatedInput.data.campaignName]
    if (currentTime < eventDuration.START_TIME.getTime()) {
      return {
        errors: {
          campaignName: ['This event is not live yet.'],
        },
      }
    }
    if (currentTime > eventDuration.END_TIME.getTime()) {
      return {
        errors: {
          campaignName: ['This event is no longer live.'],
        },
      }
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const countryCode = await getUserAccessLocationCookie()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: { include: { primaryUserCryptoAddress: true, address: true } },
  })

  let user = userMatch.user
  if (!user) {
    await triggerRateLimiterAtMostOnce()
    user = await createUser({ localUser, sessionId, countryCode })
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
    countryCode,
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification({
      userAction,
      userCryptoAddress: user.primaryUserCryptoAddress,
      countryCode,
    })
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId'> & { countryCode: string },
) {
  const { localUser, sessionId, countryCode } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      referralId: generateReferralId(),
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

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionLiveEventInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.LIVE_EVENT,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionLiveEventInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.LIVE_EVENT,
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
  countryCode,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionLiveEventInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  countryCode: string
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.LIVE_EVENT,
      campaignName: validatedInput.campaignName,
      countryCode,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.LIVE_EVENT,
    campaignName: validatedInput.campaignName,
    userState: isNewUser ? 'New' : 'Existing',
  })

  return { userAction }
}
