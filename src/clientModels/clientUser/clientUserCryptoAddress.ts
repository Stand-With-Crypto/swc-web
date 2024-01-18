import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserCryptoAddress } from '@prisma/client'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork'>
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, cryptoAddress, cryptoNetwork } = record
  return getClientModel({
    id,
    cryptoAddress,
    cryptoNetwork,
  })
}
