import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { toBigNumber } from '@/utils/shared/bigNumber'
import { NFTSlug } from '@/utils/shared/nft'

export const ETH_NFT_DONATION_AMOUNT = toBigNumber('0.00435')

export const MINT_NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_OVERRIDE_MINT_NFT_CONTRACT_ADDRESS ??
  NFT_SLUG_BACKEND_METADATA[NFTSlug.SWC_SHIELD].contractAddress

export enum UserActionFormNFTMintSectionNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  TRANSACTION_WATCH = 'transactionWatch',
}

export const ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT = 'User Action Form NFT Mint'
