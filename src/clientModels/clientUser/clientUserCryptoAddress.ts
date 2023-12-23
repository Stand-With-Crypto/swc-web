import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { Address, UserCryptoAddress } from '@prisma/client'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'address' | 'cryptoNetwork'>
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, address, cryptoNetwork } = record
  return getClientModel({
    id,
    address,
    cryptoNetwork,
  })
}
