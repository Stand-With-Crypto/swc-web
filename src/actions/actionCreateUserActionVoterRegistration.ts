'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getCountryCodeCookie } from '@/utils/server/getCountryCodeCookie'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import {
  getServerAnalytics,
  getServerPeopleAnalytics,
  ServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodUsaState } from '@/validation/fields/zodUsaState'

const logger = getLogger(`actionCreateUserActionVoterRegistration`)

const createActionVoterRegistrationInputValidationSchema = object({
  campaignName: nativeEnum(UserActionVoterRegistrationCampaignName),
  usaState: zodUsaState.optional(),
})

export type CreateActionVoterRegistrationInput = z.infer<
  typeof createActionVoterRegistrationInputValidationSchema
>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  countryCode: Awaited<ReturnType<typeof getCountryCodeCookie>>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionVoterRegistration = withServerActionMiddleware(
  'actionCreateUserActionVoterRegistration',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionVoterRegistration,
  ),
)

async function _actionCreateUserActionVoterRegistration(input: CreateActionVoterRegistrationInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput = createActionVoterRegistrationInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const countryCode = await getCountryCodeCookie()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: { include: { primaryUserCryptoAddress: true, address: true } },
  })

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }
  const { user, peopleAnalytics } = userMatch.user
    ? {
        user: userMatch.user,
        peopleAnalytics: getServerPeopleAnalytics({
          localUser,
          userId: userMatch.user.id,
        }),
      }
    : await createUser({ localUser, sessionId, countryCode })

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
    sharedDependencies: { sessionId, analytics, peopleAnalytics, countryCode },
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification({
      userAction,
      userCryptoAddress: user.primaryUserCryptoAddress,
      countryCode: countryCode as SupportedCountryCodes,
    })
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId' | 'countryCode'>,
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

  const peopleAnalytics: ServerPeopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: createdUser.id,
  })
  if (localUser?.persisted) {
    waitUntil(
      peopleAnalytics
        .setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        .flush(),
    )
  }

  return { user: createdUser, peopleAnalytics }
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionVoterRegistrationInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionVoterRegistrationInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.VOTER_REGISTRATION,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
    usaState: validatedInput.data.usaState,
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
  validatedInput: CreateActionVoterRegistrationInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<
    SharedDependencies,
    'sessionId' | 'analytics' | 'peopleAnalytics' | 'countryCode'
  >
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      countryCode: sharedDependencies.countryCode,
      user: { connect: { id: user.id } },
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionVoterRegistration: {
        create: {
          usaState: validatedInput.usaState,
        },
      },
    },
    include: {
      userActionVoterRegistration: true,
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.VOTER_REGISTRATION,
    campaignName: validatedInput.campaignName,
    usaState: validatedInput.usaState,
    userState: isNewUser ? 'New' : 'Existing',
  })

  if (validatedInput.usaState) {
    sharedDependencies.peopleAnalytics.set({
      usaState: validatedInput.usaState,
    })
  }

  return { userAction }
}
