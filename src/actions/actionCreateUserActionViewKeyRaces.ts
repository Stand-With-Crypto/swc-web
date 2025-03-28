'use server'
import 'server-only'

import { SMSStatus, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getCountryCodeCookie } from '@/utils/server/getCountryCodeCookie'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import {
  GetCongressionalDistrictFromAddressSuccess,
  maybeGetCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { UserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'

const logger = getLogger(`actionCreateUserActionViewKeyRaces`)

const createActionViewKeyRacesInputValidationSchema = object({
  address: zodAddress.optional(),
  usCongressionalDistrict: string().optional(),
  usaState: string().optional(),
  shouldBypassAuth: z.boolean().optional(),
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

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()

  const countryCode = await getCountryCodeCookie()

  const actionType = UserActionType.VIEW_KEY_RACES
  const campaignName = UserActionViewKeyRacesCampaignName['2025_US_ELECTIONS']

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, primaryUserEmailAddress: true, address: true },
    },
  })

  const shouldBypassAuth = validatedInput.data?.shouldBypassAuth
  if (!userMatch.user && !shouldBypassAuth) {
    logger.info('User not logged in')

    return
  }

  const user =
    userMatch.user ||
    (await createUser({ localUser, sessionId, countryCode, address: validatedInput.data?.address }))

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
    logger.info(`User ${userId} has not opted in`)

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

    if (!shouldBypassAuth) {
      return { user: getClientUser(user) }
    }
  }

  const currentUsaState =
    userAddress?.address?.administrativeAreaLevel1 ?? validatedInput.data?.usaState ?? null

  const maybeCongressionalDistrict = (await maybeGetCongressionalDistrictFromAddress(
    { countryCode: 'US', formattedDescription: userAddress?.address?.formattedDescription ?? '' },
    { stateCode: currentUsaState as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP },
  )) as GetCongressionalDistrictFromAddressSuccess

  const userAddressCongressionalDistrict =
    userAddress?.address?.usCongressionalDistrict &&
    userAddress?.address?.usCongressionalDistrict !== '0'
      ? userAddress?.address?.usCongressionalDistrict
      : null

  const currentCongressionalDistrict =
    userAddressCongressionalDistrict ||
    validatedInput.data?.usCongressionalDistrict ||
    maybeCongressionalDistrict?.districtNumber?.toString() ||
    null

  const existingViewKeyRacesAction = await getUserAlreadyViewedKeyRaces(userId, campaignName)

  if (existingViewKeyRacesAction) {
    logger.info(`User ${userId} has already viewed key races`)

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
        validatedInput.data,
      )

      analytics.trackUserActionUpdated({
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

  logger.info(`Creating new action for user ${userId}`)

  await triggerRateLimiterAtMostOnce()

  await createUserActionViewKeyRaces(
    userId,
    countryCode,
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

async function updateUserActionViewKeyRaces(
  existingViewKeyRacesAction: Awaited<ReturnType<typeof getUserAlreadyViewedKeyRaces>>,
  usaState: string | null,
  usCongressionalDistrict: string | null,
  validatedInput: CreateActionViewKeyRacesInput,
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

  const userAction = await prismaClient.userAction.update({
    where: {
      id: existingViewKeyRacesAction?.id,
    },
    data: {
      userActionViewKeyRaces: {
        update: updateData,
      },
    },
  })

  logger.info('updated user action')

  if (validatedInput?.address) {
    await prismaClient.user.update({
      where: { id: existingViewKeyRacesAction?.userId },
      data: {
        address: {
          connectOrCreate: {
            where: { googlePlaceId: validatedInput.address.googlePlaceId },
            create: validatedInput.address,
          },
        },
      },
      include: {
        address: true,
      },
    })
    logger.info('updated user address')
  }

  return { userAction }
}

async function createUserActionViewKeyRaces(
  userId: string,
  countryCode: string,
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
      countryCode,
      actionType: UserActionType.VIEW_KEY_RACES,
      campaignName: UserActionViewKeyRacesCampaignName['2025_US_ELECTIONS'],
      userActionViewKeyRaces: {
        create: {
          usCongressionalDistrict,
          usaState,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
}

async function getUserAlreadyViewedKeyRaces(
  userId: string,
  campaignName: UserActionViewKeyRacesCampaignName,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VIEW_KEY_RACES,
      user: {
        id: userId,
      },
      campaignName,
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
