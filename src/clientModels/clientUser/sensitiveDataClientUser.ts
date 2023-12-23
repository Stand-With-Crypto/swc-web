import {
  ClientUserCryptoAddress,
  getClientUserCryptoAddress,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { User, UserCryptoAddress } from '@prisma/client'

export type SensitiveDataClientUser = ClientModel<
  Pick<User, 'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible'> & {
    name: string | null
    cryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & { userCryptoAddress: null | UserCryptoAddress },
): SensitiveDataClientUser => {
  const { name, userCryptoAddress, id, datetimeCreated, datetimeUpdated, isPubliclyVisible } =
    record
  return getClientModel({
    name,
    cryptoAddress: userCryptoAddress ? getClientUserCryptoAddress(userCryptoAddress) : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  })
}
