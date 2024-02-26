/*
This hook wraps the useUser hook from @thirdweb-dev/react-core and adds our jwt-specific metadata we pass back to the client
see https://portal.thirdweb.com/wallets/auth/server-frameworks/next#enhancing-session-data
and https://github.com/Stand-With-Crypto/swc-web/blob/a99648eb4097dffb335155375b7d5b439c9b997c/src/utils/server/thirdweb/thirdwebAuthConfig.ts#L50
*/

import { Json } from '@thirdweb-dev/auth'
import { useUser } from '@thirdweb-dev/react'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'

export function useAuthUser() {
  const data = useUser<Json, AuthSessionMetadata>()
  return {
    ...data,
    user: data.user
      ? {
          ...data.user,
          userId: data.user.session!.userId,
          address: parseThirdwebAddress(data.user.address),
        }
      : undefined,
  }
}
