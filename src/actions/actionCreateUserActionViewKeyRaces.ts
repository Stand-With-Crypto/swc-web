'use server'
import 'server-only'

import { SMSStatus, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
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
import { maybeGetElectoralZoneFromAddress } from '@/utils/shared/getElectoralZoneFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

const logger = getLogger(`actionCreateUserActionViewKeyRaces`)

const createActionViewKeyRacesInputValidationSchema = object({
  campaignName: string().optional(),
  address: zodAddress.optional(),
  electoralZone: string().optional(),
  usaState: string().optional(),
  shouldBypassAuth: z.boolean().optional(),
  stateCode: string().optional(),
  constituency: string().optional(),
  countryCode: zodSupportedCountryCode,
})

export type CreateActionViewKeyRacesInput = z.infer<
  typeof createActionViewKeyRacesInputValidationSchema
>

export const actionCreateUserActionViewKeyRaces = withServerActionMiddleware(
  'actionCreateUserActionViewKeyRaces',
  _actionCreateUserActionViewKeyRaces,
)

async function _actionCreateUserActionViewKeyRaces(input: CreateActionViewKeyRacesInput) {
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

  const countryCode = validatedInput.data.countryCode
  const actionType = UserActionType.VIEW_KEY_RACES

  if (
    !validatedInput.data?.campaignName ||
    !isSupportedCampaignName(countryCode, validatedInput.data?.campaignName)
  ) {
    return {
      errors: { campaignName: ['Invalid campaign name'] },
    }
  }

  const campaignName = validatedInput.data.campaignName

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

  if (user.countryCode !== countryCode) {
    logger.info('User country code does not match page country code, aborting')
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

  const existingViewKeyRacesAction = await getUserAlreadyViewedKeyRaces({
    userId,
    campaignName,
    countryCode,
  })
  if (existingViewKeyRacesAction) {
    logger.info(`User ${userId} has already viewed key races`)
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

  const currentUsaState =
    userAddress?.address?.administrativeAreaLevel1 ?? validatedInput.data?.usaState ?? null

  const maybeElectoralZone = await maybeGetElectoralZoneFromAddress({
    address: {
      formattedDescription:
        userAddress?.address?.formattedDescription ||
        validatedInput.data.address?.formattedDescription ||
        '',
      googlePlaceId: userAddress?.address?.googlePlaceId || null,
      latitude: userAddress?.address?.latitude || null,
      longitude: userAddress?.address?.longitude || null,
    },
  })
  const userAddressElectoralZone = userAddress?.address?.electoralZone
  const currentElectoralZone =
    userAddressElectoralZone ||
    validatedInput.data?.electoralZone ||
    ('zoneName' in maybeElectoralZone && maybeElectoralZone.zoneName) ||
    null

  await createUserActionViewKeyRaces(
    userId,
    countryCode,
    campaignName,
    currentUsaState,
    currentElectoralZone,
    validatedInput.data?.stateCode ?? null,
    validatedInput.data?.constituency ?? null,
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

async function createUserActionViewKeyRaces(
  userId: string,
  countryCode: string,
  campaignName: string,
  usaState: string | null,
  electoralZone: string | null,
  stateCode: string | null,
  constituency: string | null,
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
      campaignName,
      userActionViewKeyRaces: {
        create: {
          electoralZone,
          usaState,
          stateCode,
          constituency,
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

async function getUserAlreadyViewedKeyRaces({
  userId,
  campaignName,
  countryCode,
}: {
  userId: string
  campaignName: string
  countryCode: SupportedCountryCodes
}) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VIEW_KEY_RACES,
      user: {
        id: userId,
      },
      campaignName,
      countryCode,
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
          electoralZone: true,
          formattedDescription: true,
          countryCode: true,
          googlePlaceId: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  })
}

const isSupportedCampaignName = (countryCode: string, campaignName?: string) => {
  return (
    getActionDefaultCampaignName(
      UserActionType.VIEW_KEY_RACES,
      countryCode as SupportedCountryCodes,
    ) === campaignName
  )
}
