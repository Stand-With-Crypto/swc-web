import {
  ClientUserCryptoAddress,
  getClientUserCryptoAddress,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { User, UserCryptoAddress } from '@prisma/client'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'isPubliclyVisible'> & {
    fullName: string | null
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getClientUser = (
  record: User & { primaryUserCryptoAddress: null | UserCryptoAddress },
): ClientUser => {
  const { fullName, primaryUserCryptoAddress, id, isPubliclyVisible } = record
  return getClientModel({
    fullName: isPubliclyVisible ? fullName : null,
    primaryUserCryptoAddress:
      isPubliclyVisible && primaryUserCryptoAddress
        ? getClientUserCryptoAddress(primaryUserCryptoAddress)
        : null,
    id,
    isPubliclyVisible,
  })
}
