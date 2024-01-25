import { requiredEnv } from "@/utils/shared/requiredEnv";

const SWC_SHIELD_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.SWC_SHIELD_NFT_CONTRACT_ADDRESS,
  'SWC_SHIELD_NFT_CONTRACT_ADDRESS',
)

const CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
  'CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS',
)

export const SWCShieldThirdWebNFT={
  Slug:"swc-shield",
  ContractAddress: SWC_SHIELD_NFT_CONTRACT_ADDRESS
}

export const CallYourRepresentativeSept11ThirdWebNFT={
  Slug:"call-representative-sept-11",
  ContractAddress:CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS
}
