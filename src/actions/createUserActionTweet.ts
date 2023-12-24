'use server'
import 'server-only'
import { z } from 'zod'
import { zodEmailYourCongressperson } from '@/validation/zodEmailYourCongressperson'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserActionType } from '@prisma/client'
import { getLogger } from '@/utils/shared/logger'
import { getExistingUserAndMethodOfMatch } from 'src/utils/server/getExistingUserAndMethodOfMatch'

const logger = getLogger(`createUserActionTweet`)

export async function createUserActionTweet() {
  const userMatch = await getExistingUserAndMethodOfMatch()
  const existingUserActionTweet = userMatch.user
    ? await prismaClient.userAction.findFirst({
        where: {
          actionType: UserActionType.TWEET,
          userId: userMatch.user.id,
        },
      })
    : null
  if (existingUserActionTweet) {
    logger.warn(`createUserActionTweet: skipping creation because one for this user already exists`)
    return
  }
  const userAction = await prismaClient.userAction.create({
    data: {
      actionType: UserActionType.TWEET,
      userSession: 'sessionId' in userMatch ? { connect: { id: userMatch.sessionId } } : undefined,
      userCryptoAddress:
        'userCryptoAddressId' in userMatch
          ? { connect: { id: userMatch.userCryptoAddressId } }
          : undefined,
      user:
        'userCryptoAddressId' in userMatch
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
