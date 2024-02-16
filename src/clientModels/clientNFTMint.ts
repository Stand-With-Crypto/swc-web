import { NFTMint } from '@prisma/client'

import { ClientModel, getClientModel } from '@/clientModels/utils'

export type ClientNFTMint = ClientModel<
  Pick<NFTMint, 'id' | 'costAtMintCurrencyCode'> & {
    costAtMint: number
    costAtMintUsd: number
    nftSlug: string
  }
>

export const getClientNFTMint = (record: NFTMint): ClientNFTMint => {
  const { id, costAtMint, costAtMintCurrencyCode, costAtMintUsd, nftSlug } = record
  return getClientModel({
    id,
    costAtMint: costAtMint.toNumber(),
    costAtMintUsd: costAtMintUsd.toNumber(),
    costAtMintCurrencyCode,
    nftSlug,
  })
}
