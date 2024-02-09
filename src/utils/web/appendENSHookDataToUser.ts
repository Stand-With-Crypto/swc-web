import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { ClientUserCryptoAddressWithENSData } from '@/clientModels/clientUser/clientUserCryptoAddress'
import { useENS } from '@thirdweb-dev/react'

export function appendENSHookDataToUser<U extends ClientUser>(
  user: U,
  ensData: ReturnType<typeof useENS>['data'],
): Omit<U, 'primaryUserCryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
} {
  return {
    ...user,
    primaryUserCryptoAddress: user.primaryUserCryptoAddress && {
      ...user.primaryUserCryptoAddress,
      ensAvatarUrl: ensData?.avatarUrl || null,
      ensName: ensData?.ens || null,
    },
  }
}
