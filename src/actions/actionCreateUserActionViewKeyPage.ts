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
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

const logger = getLogger(`actionCreateUserActionViewKeyRaces`)

const createActionViewKeyPageInputValidationSchema = object({
  campaignName: string(),
  countryCode: zodSupportedCountryCode,
  path: string(),
})

export type CreateActionViewKeyPageInput = z.infer<
  typeof createActionViewKeyPageInputValidationSchema
>

export const actionCreateUserActionViewKeyPage = withServerActionMiddleware(
  'actionCreateUserActionViewKeyPage',
  _actionCreateUserActionViewKeyPage,
)

async function _actionCreateUserActionViewKeyPage(input: CreateActionViewKeyPageInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionViewKeyPageInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()

  const countryCode = validatedInput.data.countryCode
  const actionType = UserActionType.VIEW_KEY_PAGE

  if (!validatedInput.data?.campaignName) {
    return {
      errors: { campaignName: ['Invalid campaign name'] },
    }
  }

  const campaignName = validatedInput.data.campaignName
  const path = validatedInput.data.path

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, primaryUserEmailAddress: true, address: true },
    },
  })

  const user = userMatch.user || (await createUser({ localUser, sessionId, countryCode }))

  if (user.countryCode !== countryCode) {
    logger.info('User country code does not match page country code, aborting')
    return { user: getClientUser(user) }
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

  const userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
  })
  if (userAction) {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: 'On Site',
      reason: 'Already Exists',
      userState: 'Existing',
    })

    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  logger.info(`Creating new action for user ${userId}`)

  await triggerRateLimiterAtMostOnce()

  await createUserActionViewKeyPage({
    userId,
    countryCode,
    campaignName,
    path,
  })

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
  countryCode,
}: {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
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

async function createUserActionViewKeyPage({
  userId,
  campaignName,
  countryCode,
  path,
}: {
  userId: string
  campaignName: string
  countryCode: string
  path: string
}) {
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
      actionType: UserActionType.VIEW_KEY_PAGE,
      campaignName,
      userActionViewKeyPage: { create: { path } },
      user: { connect: { id: userId } },
    },
  })
}
