'use server'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { UserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns'
import { UserActionType } from '@prisma/client'
import 'server-only'

const logger = getLogger(`actionUserActionTweet`)

export async function actionUserActionTweet() {
  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: {
      userCryptoAddress: { select: { id: true } },
      userActions: {
        where: { actionType: UserActionType.TWEET },
        select: { id: true },
      },
    },
  })
  if (userMatch.user?.userActions.length) {
    logger.warn(`createUserActionTweet: skipping creation because one for this user already exists`)
    return
  }
  const userAction = await prismaClient.userAction.create({
    data: {
      actionType: UserActionType.TWEET,
      campaignName: UserActionTweetCampaignName.DEFAULT,
      userSession: 'sessionId' in userMatch ? { connect: { id: userMatch.sessionId } } : undefined,
      userCryptoAddress:
        'userCryptoAddress' in userMatch
          ? { connect: { id: userMatch.userCryptoAddress.id } }
          : undefined,
      user:
        'userCryptoAddress' in userMatch
          ? {
              connect: { id: userMatch.user.id },
            }
          : userMatch.user
            ? {
                connect: { id: userMatch.user.id },
              }
            : {
                create: {
                  isPubliclyVisible: false,
                  userSessions: {
                    create: {
                      id: userMatch.sessionId,
                    },
                  },
                },
              },
    },
  })
  return {
    userAction,
  }
}
