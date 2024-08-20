'use server'
import 'server-only'

import { User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { R } from 'node_modules/@upstash/redis/zmscore-80635339'
import { object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
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
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'

const logger = getLogger(`actionCreateUserActionViewKeyRaces`)

const createActionViewKeyRacesInputValidationSchema = object({
  usCongressionalDistrict: string().optional(),
  usaState: string().optional(),
}).optional()

export type CreateActionViewKeyRacesInput = z.infer<
  typeof createActionViewKeyRacesInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionViewKeyRaces = withServerActionMiddleware(
  'actionCreateUserActionViewKeyRaces',
  _actionCreateUserActionViewKeyRaces,
)

async function _actionCreateUserActionViewKeyRaces(input: CreateActionViewKeyRacesInput = {}) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionViewKeyRacesInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, primaryUserEmailAddress: true, address: true },
    },
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
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const recentViewKeyRacesUserAction = await getRecentUserActionByUserId(user.id, validatedInput)

  if (recentViewKeyRacesUserAction) {
    const hasTheSameInfo =
      recentViewKeyRacesUserAction.userActionViewKeyRaces?.usaState ===
        (validatedInput.data?.usaState ?? null) &&
      recentViewKeyRacesUserAction.userActionViewKeyRaces?.usCongressionalDistrict ===
        (validatedInput.data?.usCongressionalDistrict ?? null)

    if (hasTheSameInfo) {
      logSpamActionSubmissions({
        sharedDependencies: { analytics },
      })
      waitUntil(beforeFinish())

      return { user: getClientUser(user) }
    }
  }

  await triggerRateLimiterAtMostOnce()
  await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionViewKeyRacesInput>,
) {
  const hasStateInfo = !!validatedInput.data?.usaState
  const hasDistrictInfo = !!validatedInput.data?.usCongressionalDistrict

  return prismaClient.userAction.findFirst({
    where: {
      userId: userId,
      actionType: UserActionType.VIEW_KEY_RACES,
      ...(hasStateInfo &&
        !hasDistrictInfo && {
          userActionViewKeyRaces: {
            usaState: validatedInput.data?.usaState,
            usCongressionalDistrict: null,
          },
        }),
      ...(hasStateInfo &&
        hasDistrictInfo && {
          userActionViewKeyRaces: {
            usCongressionalDistrict: validatedInput.data?.usCongressionalDistrict,
            usaState: validatedInput.data?.usaState,
          },
        }),
    },
    include: {
      userActionViewKeyRaces: true,
    },
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
  validatedInput: CreateActionViewKeyRacesInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  isNewUser: boolean
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      userSession: { connect: { id: sharedDependencies.sessionId } },
      ...(userMatch.user?.primaryUserEmailAddressId && {
        userEmailAddress: {
          connect: {
            id: userMatch.user?.primaryUserEmailAddressId,
          },
        },
      }),
      actionType: UserActionType.VIEW_KEY_RACES,
      campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VIEW_KEY_RACES,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionViewKeyRaces: {
        create: {
          usCongressionalDistrict: validatedInput?.usCongressionalDistrict || null,
          usaState: validatedInput?.usaState || null,
        },
      },
    },
    include: {
      userActionViewKeyRaces: true,
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.VIEW_KEY_RACES,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VIEW_KEY_RACES,
    userState: isNewUser ? 'New' : 'Existing',
  })

  return { userAction }
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
      primaryUserEmailAddress: true,
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

function logSpamActionSubmissions({
  sharedDependencies,
}: {
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.VIEW_KEY_RACES,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VIEW_KEY_RACES,
    reason: 'Too Many Recent',
    userState: 'Existing',
  })
}
