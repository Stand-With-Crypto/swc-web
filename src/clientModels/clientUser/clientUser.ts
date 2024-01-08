import {
  ClientUserCryptoAddress,
  getClientUserCryptoAddress,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { User, UserCryptoAddress } from '@prisma/client'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible'> & {
    fullName: string | null
    cryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getClientUser = (
  record: User & { userCryptoAddress: null | UserCryptoAddress },
): ClientUser => {
  const { fullName, userCryptoAddress, id, datetimeCreated, datetimeUpdated, isPubliclyVisible } =
    record
  return getClientModel({
    fullName: isPubliclyVisible ? fullName : null,
    cryptoAddress:
      isPubliclyVisible && userCryptoAddress ? getClientUserCryptoAddress(userCryptoAddress) : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  })
}
