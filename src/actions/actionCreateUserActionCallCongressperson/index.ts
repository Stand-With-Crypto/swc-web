'use server'
import 'server-only'

import * as Sentry from '@sentry/nextjs'
import {
  UserAndMethodOfMatch,
  getMaybeUserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { getLogger } from '@/utils/shared/logger'
import { User, UserAction, UserActionType } from '@prisma/client'
import { subDays } from 'date-fns'
import { z } from 'zod'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/severAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'

import { createActionCallCongresspersonInputValidationSchema } from './inputValidationSchema'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics?: ReturnType<typeof getServerAnalytics>
}

const logger = getLogger(`actionCreateUserActionCallCongressperson`)
export async function actionCreateUserActionCallCongressperson(
  input: CreateActionCallCongresspersonInput,
) {
  logger.info('triggered')

  const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const sharedDependencies: SharedDependencies = {
    localUser: parseLocalUserFromCookies(),
    sessionId: getUserSessionId(),
  }

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  const user = await getOrCreateUser(userMatch, sharedDependencies)
  if (!user) {
    throw new Error("Couldn't create user")
  }
  sharedDependencies.analytics = getServerAnalytics({
    ...userMatch,
    localUser: sharedDependencies.localUser,
  })

  const recentUserAction = await getRecentUserActionByUserId(user.id)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
      sharedDependencies,
    })
    return { user, userAction: recentUserAction }
  }

  const userAction = await createAction({
    user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies,
  })

  // TODO: Mint "Call" NFT

  return { user, userAction }
}

async function getOrCreateUser(
  userMatch: UserAndMethodOfMatch,
  sharedDependencies: SharedDependencies,
) {
  if (userMatch?.user) {
    logger.info('fetched user')
    return userMatch.user
  }

  const { localUser, sessionId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      isPubliclyVisible: false,
      userSessions: { create: { id: sessionId } },
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    const peopleAnalytics = getServerPeopleAnalytics({ localUser: localUser, sessionId: sessionId })
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }

  return createdUser
}

async function getRecentUserActionByUserId(userId: User['id']) {
  return prismaClient.userAction.findFirst({
    where: {
      datetimeCreated: {
        lte: subDays(new Date(), 1),
      },
      actionType: UserActionType.CALL,
      campaignName: UserActionCallCampaignName.DEFAULT,
      userId: userId,
    },
    include: {
      userActionEmail: true,
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
    z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  >
  userAction: UserAction
  userId: User['id']
  sharedDependencies: SharedDependencies
}) {
  sharedDependencies.analytics?.trackUserActionCreatedIgnored({
    actionType: UserActionType.CALL,
    campaignName: UserActionCallCampaignName.DEFAULT,
    reason: 'Too Many Recent',
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.CALL} user action for campaign ${UserActionCallCampaignName.DEFAULT} submitted`,
    {
      extra: { validatedInput: validatedInput.data, userAction },
      user: { id: userId },
    },
  )
}

async function createAction({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
}: {
  user: User
  validatedInput: z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  userMatch: UserAndMethodOfMatch
  sharedDependencies: SharedDependencies
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      userActionCall: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
          recipientPhoneNumber: validatedInput.phoneNumber,
        },
      },
    },
    include: {
      userActionCall: true,
    },
  })

  logger.info('created user action')
  sharedDependencies.analytics?.trackUserActionCreated({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
  })

  return userAction
}
