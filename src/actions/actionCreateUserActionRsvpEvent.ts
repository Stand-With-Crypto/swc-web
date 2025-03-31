'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { boolean, object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getCountryCodeFromURL } from '@/utils/server/getCountryCodeFromURL'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
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
import { US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const logger = getLogger(`actionCreateUserActionRsvpEvent`)

const createActionRsvpEventInputValidationSchema = object({
  eventState: string(),
  eventSlug: string(),
  shouldReceiveNotifications: boolean(),
})

export type CreateActionRsvpEventInput = z.infer<typeof createActionRsvpEventInputValidationSchema>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionRsvpEvent = withServerActionMiddleware(
  'actionCreateUserActionRsvpEvent',
  _actionCreateUserActionRsvpEvent,
)

async function _actionCreateUserActionRsvpEvent(input: CreateActionRsvpEventInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionRsvpEventInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const countryCode = await getCountryCodeFromURL()

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

  const recentRsvpEventUserAction = await getRecentUserActionByUserId(user.id, validatedInput)
  const rsvpEventuserAction = recentRsvpEventUserAction?.userActionRsvpEvent
  const shouldUpdateRsvpEventNotificationStatus =
    rsvpEventuserAction?.shouldReceiveNotifications === false &&
    validatedInput.data.shouldReceiveNotifications === true

  if (recentRsvpEventUserAction && !shouldUpdateRsvpEventNotificationStatus) {
    logSpamActionSubmissions({
      sharedDependencies: { analytics },
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  if (shouldUpdateRsvpEventNotificationStatus && rsvpEventuserAction.id) {
    await changeReceiveNotificationStatus({
      userActionRsvpEventId: rsvpEventuserAction.id,
      sharedDependencies: { sessionId, analytics, peopleAnalytics },
    })

    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
    countryCode,
  })

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

async function changeReceiveNotificationStatus({
  userActionRsvpEventId,
  sharedDependencies,
}: {
  userActionRsvpEventId: string
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  await prismaClient.userActionRsvpEvent.update({
    where: {
      id: userActionRsvpEventId,
    },
    data: {
      shouldReceiveNotifications: true,
    },
  })
  logger.info('updated user action rsvp event - notification status')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.RSVP_EVENT,
    campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
    userState: 'Existing',
    shouldReceiveNotifications: true,
  })
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionRsvpEventInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.RSVP_EVENT,
      userId: userId,
      userActionRsvpEvent: {
        eventSlug: validatedInput.data.eventSlug,
        eventState: validatedInput.data.eventState,
      },
    },
    include: {
      userActionRsvpEvent: true,
    },
  })
}

function logSpamActionSubmissions({
  sharedDependencies,
}: {
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.RSVP_EVENT,
    campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
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
  validatedInput: CreateActionRsvpEventInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  countryCode: string
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.RSVP_EVENT,
      campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
      countryCode,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionRsvpEvent: {
        create: {
          eventSlug: validatedInput.eventSlug,
          eventState: validatedInput.eventState,
          shouldReceiveNotifications: validatedInput.shouldReceiveNotifications,
        },
      },
    },
    include: {
      userActionRsvpEvent: true,
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.RSVP_EVENT,
    campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
    userState: isNewUser ? 'New' : 'Existing',
    shouldReceiveNotifications: validatedInput.shouldReceiveNotifications,
  })

  return { userAction }
}
