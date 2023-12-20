import { NFTMint } from '@prisma/client'

export type ClientNFTMint = Pick<
  NFTMint,
  'id' | 'costAtMint' | 'costAtMintCurrencyCode' | 'constAtMintUsd'
>

export const getClientNFTMint = (record: NFTMint): ClientNFTMint => {
  const { id, costAtMint, costAtMintCurrencyCode, constAtMintUsd } = record
  return {
    id,
    costAtMint,
    costAtMintCurrencyCode,
    constAtMintUsd,
  }
}
