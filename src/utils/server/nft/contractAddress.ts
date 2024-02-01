import { NFTSlug } from '@/utils/shared/nft'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { UserActionType } from '@prisma/client'

const SWC_SHIELD_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.SWC_SHIELD_NFT_CONTRACT_ADDRESS,
  'SWC_SHIELD_NFT_CONTRACT_ADDRESS',
)

const CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
  'CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS',
)

export const NFT_CONTRACT_ADDRESS: Record<NFTSlug, string> = {
  [NFTSlug.SWC_SHIELD]: SWC_SHIELD_NFT_CONTRACT_ADDRESS,
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
}

export const ACTION_NFT_SLUG: Record<UserActionType, NFTSlug | null> = {
  [UserActionType.OPT_IN]: NFTSlug.SWC_SHIELD,
  [UserActionType.CALL]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
  [UserActionType.EMAIL]: null,
  [UserActionType.DONATION]: null,
  [UserActionType.NFT_MINT]: null,
  [UserActionType.TWEET]: null,
}
