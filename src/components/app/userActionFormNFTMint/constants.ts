import { toBigNumber } from '@/utils/shared/bigNumber'

export const ETH_NFT_DONATION_AMOUNT = toBigNumber('0.00435')

export const MINT_NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_OVERRIDE_MINT_NFT_CONTRACT_ADDRESS ??
  '0x741B334b0690de44Bce6c926a1F74Ca69C95c80c'

export enum UserActionFormNFTMintSectionNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  TRANSACTION_WATCH = 'transactionWatch',
}

export const ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT = 'User Action Form NFT Mint'
