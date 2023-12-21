import { ClientModel, getClientModel } from '@/clientModels/utils'
import { NFT } from '@prisma/client'

export type ClientNFT = ClientModel<
  Pick<NFT, 'id' | 'name' | ('costCurrencyCode' & { cost: number })>
>

export const getClientNFT = (record: NFT): ClientNFT => {
  const { id, name, cost, costCurrencyCode } = record
  return getClientModel({
    id,
    name,
    cost: cost.toNumber(),
    costCurrencyCode,
  })
}
