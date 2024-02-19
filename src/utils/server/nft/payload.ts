import { NFTSlug } from '@/utils/shared/nft'

export interface AirdropPayload {
  nftMintId: string
  nftSlug: NFTSlug
  recipientWalletAddress: string
}
