import { NFT } from '@prisma/client'

export type ClientNFT = Pick<NFT, 'id' | 'name' | 'cost' | 'costCurrencyCode'>

export const getClientNFT = (record: NFT): ClientNFT => {
  const { id, name, cost, costCurrencyCode } = record
  return {
    id,
    name,
    cost,
    costCurrencyCode,
  }
}
