'use server'
import 'server-only'

import { User, UserAction, UserActionType, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { nativeEnum, object, string, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'

const logger = getLogger(`actionCreateUserActionVoterRegistration`)

const createActionVoterRegistrationInputValidationSchema = object({
  campaignName: nativeEnum(UserActionVoterRegistrationCampaignName),
  state: string(),
})

export type CreateActionVoterRegistrationInput = z.infer<
  typeof createActionVoterRegistrationInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
}

export const actionCreateUserActionVoterRegistration = withServerActionMiddleware(
  'actionCreateUserActionVoterRegistration',
  _actionCreateUserActionVoterRegistration,
)

async function _actionCreateUserActionVoterRegistration(input: CreateActionVoterRegistrationInput) {
  logger.info('triggered')

  const validatedInput = createActionVoterRegistrationInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true, address: true },
  })
  await throwIfRateLimited()

  const user = userMatch.user || (await createUser({ localUser, sessionId }))

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })

  const recentUserAction = await getRecentUserActionByUserId(user.id)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
      sharedDependencies: { analytics },
    })
    return { user: getClientUser(user) }
  }

  const { userAction } = await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFT(userAction, user.primaryUserCryptoAddress)
  }

  return { user: getClientUser(user) }
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
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    getServerPeopleAnalytics({ localUser, userId: createdUser.id }).setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }

  return createdUser
}

async function getRecentUserActionByUserId(userId: User['id']) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  userAction,
  userId,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<
    z.infer<typeof createActionVoterRegistrationInputValidationSchema>
  >
  userAction: UserAction
  userId: User['id']
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.VOTER_REGISTRATION,
    campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
    reason: 'Too Many Recent',
    userState: 'Existing',
    state: validatedInput.data.state,
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.VOTER_REGISTRATION} user action for campaign ${UserActionVoterRegistrationCampaignName.DEFAULT} submitted`,
    {
      extra: { validatedInput: validatedInput.data, userAction },
      user: { id: userId },
    },
  )
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
  validatedInput: z.infer<typeof createActionVoterRegistrationInputValidationSchema>
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionVoterRegistration: {
        create: {
          state: validatedInput.state,
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
    state: validatedInput.state,
    userState: isNewUser ? 'New' : 'Existing',
  })
  sharedDependencies.peopleAnalytics.set({
    state: validatedInput.state,
  })

  return { userAction }
}
