'use server'
import 'server-only'

import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import {
  ServerActionConfig,
  withServerActionMiddleware,
} from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const logger = getLogger(`actionCreateUserActionPoll`)

export interface CreatePollVoteInput {
  campaignName: string
  answers: { answer: string; isOtherAnswer: boolean }[]
}

export const actionCreateUserActionPoll = withServerActionMiddleware(
  'actionCreateUserActionPoll',
  withValidations(
    [createCountryCodeValidation(Object.values(ORDERED_SUPPORTED_COUNTRIES))],
    actionCreateUserActionPollWithoutMiddleware,
  ),
)

async function actionCreateUserActionPollWithoutMiddleware(
  input: CreatePollVoteInput,
  { countryCode }: ServerActionConfig,
) {
  logger.info('triggered')

  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({ context: 'authenticated' })

  const sessionId = await getUserSessionId()
  const localUser = await parseLocalUserFromCookies()

  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    const error = new Error('Create User Action Poll - Not authenticated')
    Sentry.captureException(error, {
      tags: { domain: 'actionCreateUserActionPoll' },
      extra: { sessionId },
    })

    throw error
  }

  const user = await prismaClient.user.findFirstOrThrow({
    where: { id: authUser.userId, countryCode },
    include: { primaryUserCryptoAddress: true, address: true },
  })

  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')
  const campaignName = input.campaignName
  const actionType = UserActionType.POLL

  const userAction = await prismaClient.userAction.findFirst({
    where: { actionType, campaignName, userId: user.id, countryCode },
    include: { userActionPoll: true },
  })

  const isVoteAgain = !!userAction && !!userAction?.userActionPoll

  await triggerRateLimiterAtMostOnce()

  if (userAction && isVoteAgain) {
    await prismaClient.userActionPollAnswer.deleteMany({
      where: { userActionPollId: userAction.id },
    })

    await prismaClient.userActionPoll.delete({ where: { id: userAction.id } })

    await prismaClient.userActionPoll.create({
      data: {
        userAction: { connect: { id: userAction.id } },
        userActionPollAnswers: {
          createMany: {
            data: input.answers.map(value => ({
              userActionCampaignName: input.campaignName,
              answer: value.answer,
              isOtherAnswer: value.isOtherAnswer,
            })),
          },
        },
      },
    })

    analytics.trackUserActionUpdated({
      actionType,
      campaignName,
      reason: 'User Voted Again',
      creationMethod: 'On Site',
      userState: 'Existing With Updates',
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  if (userAction && !isVoteAgain) {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState: 'Existing',
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await prismaClient.userAction.create({
    data: {
      countryCode,
      userActionPoll: {
        create: {
          userActionPollAnswers: {
            createMany: {
              data: input.answers.map(value => ({
                userActionCampaignName: input.campaignName,
                answer: value.answer,
                isOtherAnswer: value.isOtherAnswer,
              })),
            },
          },
        },
      },
      user: { connect: { id: user.id } },
      actionType,
      campaignName,
      ...('primaryUserCryptoAddressId' in user && user.primaryUserCryptoAddressId
        ? { userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId } } }
        : { userSession: { connect: { id: sessionId } } }),
    },
  })
  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState: 'New',
  })

  waitUntil(beforeFinish())
  logger.info('created action')
  return { user: getClientUser(user) }
}
