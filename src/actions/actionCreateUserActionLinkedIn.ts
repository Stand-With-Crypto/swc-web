'use server'
import 'server-only'

import {
  Address,
  SMSStatus,
  User,
  UserActionType,
  UserCryptoAddress,
  UserInformationVisibility,
} from '@prisma/client'
import { waitUntil } from '@vercel/functions'

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
import {
  ServerActionConfig,
  withServerActionMiddleware,
} from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger(`actionCreateUserActionLinkedIn`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  address: Address | null
}

const supportedActionCountries = Object.values(SupportedCountryCodes).filter(
  code => code !== SupportedCountryCodes.US,
)

export const actionCreateUserActionLinkedIn = withServerActionMiddleware(
  'actionCreateUserActionLinkedIn',
  withValidations(
    [createCountryCodeValidation(supportedActionCountries)],
    _actionCreateUserActionLinkedIn,
  ),
)

async function _actionCreateUserActionLinkedIn(
  { campaignName }: { campaignName: string },
  { countryCode }: ServerActionConfig,
) {
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
  const sessionId = await getUserSessionId()
  const localUser = await parseLocalUserFromCookies()

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    sessionId,
    localUser,
    countryCode,
  })
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')

  const actionType = UserActionType.LINKEDIN
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
      countryCode,
    },
  })

  if (userAction) {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState,
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      campaignName,
      countryCode,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
    },
  })
  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState,
  })

  waitUntil(beforeFinish())
  logger.info('created action')
  return { user: getClientUser(user) }
}

async function maybeUpsertUser({
  existingUser,
  sessionId,
  localUser,
  countryCode,
}: {
  existingUser: UserWithRelations | null
  sessionId: string
  localUser: ServerLocalUser | null
  countryCode: string
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
      smsStatus: SMSStatus.NOT_OPTED_IN,
      countryCode,
    },
  })
  return { user, userState: 'New' }
}
