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
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const logger = getLogger(`actionCreatePollVote`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  address: Address | null
}

export type CreatePollVoteInput = {
  campaignName: string
  answers: { answer: string; isOtherAnswer: boolean }[]
}

export const actionCreatePollVote = withServerActionMiddleware(
  'actionCreatePollVote',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    actionCreatePollVoteWithoutMiddleware,
  ),
)

async function actionCreatePollVoteWithoutMiddleware(
  input: CreatePollVoteInput,
  isVoteAgain: boolean,
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

  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
  })

  if (userAction && isVoteAgain) {
    await prismaClient.userActionPollAnswer.deleteMany({
      where: {
        userActionPollId: userAction.id,
      },
    })

    await prismaClient.userActionPoll.delete({
      where: {
        id: userAction.id,
      },
    })

    await triggerRateLimiterAtMostOnce()

    await prismaClient.userActionPoll.create({
      data: {
        userAction: {
          connect: { id: userAction.id },
        },
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
      userState,
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
      userState,
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
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
}: {
  existingUser: UserWithRelations | null
  sessionId: string
  localUser: ServerLocalUser | null
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
    },
  })
  return { user, userState: 'New' }
}
