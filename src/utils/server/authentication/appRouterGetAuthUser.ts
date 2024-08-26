import { cookies } from 'next/headers'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { appRouterGetThirdwebAuthUser } from '@/utils/server/thirdweb/appRouterGetThirdwebAuthUser'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

interface ServerAuthUser {
  userId: string
  address: string | null
}

export async function appRouterGetAuthUser(): Promise<ServerAuthUser | null> {
  const thirdwebAuthData = await appRouterGetThirdwebAuthUser()

  if (thirdwebAuthData) {
    return thirdwebAuthData
  }

  const sessionId = cookies().get(USER_SESSION_ID_COOKIE_NAME)?.value
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
    },
    where: {
      primaryUserEmailAddress: {
        isVerified: true,
      },
      userSessions: {
        some: {
          id: sessionId,
        },
      },
    },
  })
  if (!user) {
    return null
  }

  const cryptoAddress = user.primaryUserCryptoAddress
  return {
    userId: user.id,
    address: cryptoAddress ? parseThirdwebAddress(cryptoAddress.cryptoAddress) : null,
  }
}
