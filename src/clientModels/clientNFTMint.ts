import { ClientModel, getClientModel } from '@/clientModels/utils'
import { NFTMint } from '@prisma/client'

export type ClientNFTMint = ClientModel<
  Pick<NFTMint, 'id' | 'costAtMintCurrencyCode'> & { costAtMint: number; costAtMintUsd: number }
>

export const getClientNFTMint = (record: NFTMint): ClientNFTMint => {
  const { id, costAtMint, costAtMintCurrencyCode, costAtMintUsd } = record
  return getClientModel({
    costAtMint: costAtMint.toNumber(),
    costAtMintCurrencyCode,
    costAtMintUsd: costAtMintUsd.toNumber(),
    id,
  })
}
