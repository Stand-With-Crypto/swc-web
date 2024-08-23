'use server'
import 'server-only'

import { UserActionType } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import {
  GetCongressionalDistrictFromAddressSuccess,
  maybeGetCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { UserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'

const logger = getLogger(`actionCreateUserActionViewKeyRaces`)

const createActionViewKeyRacesInputValidationSchema = object({
  usCongressionalDistrict: string().optional(),
  usaState: string().optional(),
}).optional()

export type CreateActionViewKeyRacesInput = z.infer<
  typeof createActionViewKeyRacesInputValidationSchema
>

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

  const actionType = UserActionType.VIEW_KEY_RACES
  const campaignName = UserActionViewKeyRacesCampaignName['2024_ELECTION']

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, primaryUserEmailAddress: true, address: true },
    },
  })

  const user = userMatch.user

  if (!user) {
    logger.info('User not logged in')

    return
  }

  const userId = user.id

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId,
  })
  const analytics = getServerAnalytics({
    userId,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const userAddress = await getUserAddress(userId)
  const hasUserAtLeastOptedIn = await hasUserPartakenSomeAction(userId)

  if (!hasUserAtLeastOptedIn) {
    logger.info('User has not even opted in')

    analytics.track('User has not even opted in', {
      actionType,
      campaignName,
      creationMethod: 'On Site',
      reason: 'Not Opted In',
      userState: 'Existing',
      userId: user.id,
      sessionId,
    })

    waitUntil(beforeFinish())

    return { user: getClientUser(user) }
  }

  const currentUsaState =
    userAddress?.address?.administrativeAreaLevel1 ?? validatedInput.data?.usaState ?? null

  const maybeCongressionalDistrict = (await maybeGetCongressionalDistrictFromAddress(
    { countryCode: 'US', formattedDescription: userAddress?.address?.formattedDescription ?? '' },
    { stateCode: currentUsaState as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP },
  )) as GetCongressionalDistrictFromAddressSuccess

  const currentCongressionalDistrict =
    userAddress?.address?.usCongressionalDistrict ||
    validatedInput.data?.usCongressionalDistrict ||
    maybeCongressionalDistrict?.districtNumber?.toString() ||
    null

  const existingViewKeyRacesAction = await hasUserViewedKeyRaces(userId)

  if (existingViewKeyRacesAction) {
    logger.info('User already has an existing action')

    const shouldUpdateActionWithAddressInfo =
      existingViewKeyRacesAction.userActionViewKeyRaces?.usaState !== currentUsaState ||
      existingViewKeyRacesAction.userActionViewKeyRaces?.usCongressionalDistrict !==
        currentCongressionalDistrict

    const areNewValuesPresent = currentUsaState !== null || currentCongressionalDistrict !== null

    if (shouldUpdateActionWithAddressInfo && areNewValuesPresent) {
      await updateUserActionViewKeyRaces(
        existingViewKeyRacesAction,
        currentUsaState,
        currentCongressionalDistrict,
      )

      analytics.trackUserActionCreated({
        actionType,
        campaignName,
        creationMethod: 'On Site',
        userState: 'Existing With Updates',
      })

      waitUntil(beforeFinish())

      return { user: getClientUser(user) }
    }

    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: 'On Site',
      reason: 'Already Exists',
      userState: 'Existing',
    })

    waitUntil(analytics.flush())

    return { user: getClientUser(user) }
  }

  logger.info('Creating new user action')

  await triggerRateLimiterAtMostOnce()

  await createUserActionViewKeyRaces(
    userId,
    sessionId,
    currentUsaState,
    currentCongressionalDistrict,
  )

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState: 'New',
  })

  waitUntil(beforeFinish())

  return { user: getClientUser(user) }
}

async function updateUserActionViewKeyRaces(
  existingViewKeyRacesAction: Awaited<ReturnType<typeof hasUserViewedKeyRaces>>,
  usaState: string | null,
  usCongressionalDistrict: string | null,
) {
  const shouldSetDistrictAsNull =
    usaState !== existingViewKeyRacesAction?.userActionViewKeyRaces?.usaState &&
    usCongressionalDistrict === null

  const updateData: Record<string, string | undefined> = {
    ...(usaState !== null && { usaState }),
    ...(usCongressionalDistrict !== null && { usCongressionalDistrict }),
  }

  if (shouldSetDistrictAsNull) {
    Object.assign(updateData, {
      usCongressionalDistrict: null,
    })
  }

  return prismaClient.userAction.update({
    where: {
      id: existingViewKeyRacesAction?.id,
    },
    data: {
      userActionViewKeyRaces: {
        update: updateData,
      },
    },
  })
}

async function createUserActionViewKeyRaces(
  userId: string,
  sessionId: string,
  usaState: string | null,
  usCongressionalDistrict: string | null,
) {
  return prismaClient.userAction.create({
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
    },
    data: {
      actionType: UserActionType.VIEW_KEY_RACES,
      campaignName: UserActionViewKeyRacesCampaignName['2024_ELECTION'],
      userActionViewKeyRaces: {
        create: {
          usCongressionalDistrict,
          usaState,
        },
      },
      user: {
        connect: {
          id: userId,
          userSessions: {
            some: {
              id: sessionId,
            },
          },
        },
      },
    },
  })
}

async function hasUserViewedKeyRaces(userId: string) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VIEW_KEY_RACES,
      user: {
        id: userId,
      },
    },
    include: {
      userActionViewKeyRaces: true,
    },
  })
}

async function hasUserPartakenSomeAction(userId: string) {
  const actionsCount = await prismaClient.userAction.count({
    where: {
      actionType: UserActionType.OPT_IN,
      user: {
        id: userId,
      },
    },
  })

  return actionsCount > 0
}

async function getUserAddress(userId: string) {
  return prismaClient.user.findFirst({
    where: {
      id: userId,
      address: {
        countryCode: 'US',
      },
    },
    select: {
      address: {
        select: {
          administrativeAreaLevel1: true,
          usCongressionalDistrict: true,
          formattedDescription: true,
          countryCode: true,
        },
      },
    },
  })
}
