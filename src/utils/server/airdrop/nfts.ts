import { requiredEnv } from '@/utils/shared/requiredEnv'

const SWC_SHIELD_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.SWC_SHIELD_NFT_CONTRACT_ADDRESS,
  'SWC_SHIELD_NFT_CONTRACT_ADDRESS',
)

const CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
  'CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS',
)

export interface NFTInformation {
  slug: string
  contractAddress: string
}

export const SWCShieldThirdWebNFT = {
  slug: 'swc-shield',
  contractAddress: SWC_SHIELD_NFT_CONTRACT_ADDRESS,
}

export const CallYourRepresentativeSept11ThirdWebNFT = {
  slug: 'call-representative-sept-11',
  contractAddress: CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
}
