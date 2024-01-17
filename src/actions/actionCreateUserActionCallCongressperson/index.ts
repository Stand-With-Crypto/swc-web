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
import { getServerAnalytics } from '@/utils/server/severAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'

import { createActionCallCongresspersonInputValidationSchema } from './inputValidationSchema'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

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

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  const user = await getOrCreateUser(userMatch)
  if (!user && !userMatch?.user) {
    throw new Error("Couldn't create user")
  }

  const recentUserAction = await getRecentUserActionByUserId(user.id)
  if (recentUserAction) {
    logSpamActionSubmissions(userMatch, {
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
    })
    return { user, userAction: recentUserAction }
  }

  const userAction = await createAction({ user, validatedInput: validatedInput.data, userMatch })

  // TODO: Mint "Call" NFT

  return { user, userAction }
}

async function getOrCreateUser(userMatch: UserAndMethodOfMatch) {
  if (userMatch?.user) {
    logger.info('fetched user')
    return userMatch.user
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()
  const createdUser = await prismaClient.user.create({
    data: {
      isPubliclyVisible: false,
      userSessions: { create: { id: sessionId } },
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
  })
  logger.info('created user')
  return createdUser
}

async function getRecentUserActionByUserId(userId: User['id']): Promise<UserAction | null> {
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

function logSpamActionSubmissions(
  userMatch: UserAndMethodOfMatch,
  {
    validatedInput,
    userAction,
    userId,
  }: {
    validatedInput: z.SafeParseSuccess<
      z.infer<typeof createActionCallCongresspersonInputValidationSchema>
    >
    userAction: UserAction
    userId: User['id']
  },
) {
  const localUser = parseLocalUserFromCookies()
  const analytics = getServerAnalytics({ ...userMatch, localUser })

  analytics.trackUserActionCreatedIgnored({
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
}: {
  user: User
  validatedInput: z.infer<typeof createActionCallCongresspersonInputValidationSchema>
  userMatch: UserAndMethodOfMatch
}) {
  const sessionId = getUserSessionId()
  const localUser = parseLocalUserFromCookies()
  const analytics = getServerAnalytics({ ...userMatch, localUser })

  const userMatcher =
    'userCryptoAddress' in userMatch
      ? {
          userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
        }
      : { userSession: { connect: { id: sessionId } } }

  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      ...userMatcher,
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
  analytics.trackUserActionCreated({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
  })

  return userAction
}
