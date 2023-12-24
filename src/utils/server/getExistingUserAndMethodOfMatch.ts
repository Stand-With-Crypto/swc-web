'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getUserSessionIdOnAppRouter } from '@/utils/server/serverUserSessionId'
import { prismaClient } from '@/utils/server/prismaClient'
import { User, UserCryptoAddress } from '@prisma/client'
import _ from 'lodash'

export async function getExistingUserAndMethodOfMatch(): Promise<
  | {
      user: User & { userCryptoAddress: UserCryptoAddress | null }
      userCryptoAddressId: string
    }
  | {
      user: (User & { userCryptoAddress: UserCryptoAddress | null }) | null
      sessionId: string
    }
> {
  const authUser = await appRouterGetAuthUser()
  const sessionId = getUserSessionIdOnAppRouter()
  const user = await prismaClient.user.findFirst({
    where: {
      OR: _.compact([
        authUser && { userCryptoAddress: { address: authUser.address } },
        { userSessions: { some: { id: sessionId } } },
      ]),
    },
    include: {
      userCryptoAddress: true,
    },
  })
  if (authUser) {
    return {
      user: user!,
      userCryptoAddressId: user!.userCryptoAddress!.id,
    }
  }
  return {
    user,
    sessionId,
  }
}
