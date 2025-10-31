import 'server-only'

import { UserActionType } from '@prisma/client'
import { cookies } from 'next/headers'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { getThirdwebAuthUser } from '@/utils/server/thirdweb/getThirdwebAuthUser'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export interface ServerAuthUser {
  userId: string
  address: string | null
}

/**
 * Never call this function with shouldRevalidateToken set to true on an SSR page.
 */
export async function getAuthUser(
  { shouldRevalidateToken } = {
    shouldRevalidateToken: true,
  },
): Promise<ServerAuthUser | null> {
  const thirdwebAuthData = await getThirdwebAuthUser({ shouldRevalidateToken })

  if (thirdwebAuthData) {
    return thirdwebAuthData
  }

  const currentCookies = await cookies()

  const sessionId = currentCookies.get(USER_SESSION_ID_COOKIE_NAME)?.value
  if (!sessionId) {
    return null
  }

  const user = await prismaClient.user.findFirst({
    select: {
      id: true,
      primaryUserCryptoAddress: {
        select: {
          cryptoAddress: true,
        },
      },
      userActions: true,
    },
    where: {
      userSessions: {
        some: {
          id: sessionId,
        },
      },
    },
  })

  const hasOptedIn = user?.userActions.some(action => action.actionType === UserActionType.OPT_IN)

  if (!user || !hasOptedIn) {
    return null
  }

  const cryptoAddress = user.primaryUserCryptoAddress
  return {
    userId: user.id,
    address: cryptoAddress ? parseThirdwebAddress(cryptoAddress.cryptoAddress) : null,
  }
}
