import { NFTSlug } from '@/utils/shared/nft'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const SWC_SHIELD_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.SWC_SHIELD_NFT_CONTRACT_ADDRESS,
  'SWC_SHIELD_NFT_CONTRACT_ADDRESS',
)

const CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
  'CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS',
)

const I_VOTED_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.I_VOTED_NFT_CONTRACT_ADDRESS,
  'I_VOTED_NFT_CONTRACT_ADDRESS',
)

export const LEGACY_NFT_DEPLOYER_WALLET = requiredEnv(
  process.env.LEGACY_NFT_DEPLOYER_WALLET,
  'LEGACY_NFT_DEPLOYER_WALLET',
)

export const SWC_DOT_ETH_WALLET = requiredEnv(process.env.SWC_DOT_ETH_WALLET, 'SWC_DOT_ETH_WALLET')

export const NFT_SLUG_BACKEND_METADATA: Record<
  NFTSlug,
  { contractAddress: string; associatedWallet: string }
> = {
  [NFTSlug.SWC_SHIELD]: {
    contractAddress: SWC_SHIELD_NFT_CONTRACT_ADDRESS,
    associatedWallet: LEGACY_NFT_DEPLOYER_WALLET,
  },
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: {
    contractAddress: CALL_REPRESENTATIVE_NFT_CONTRACT_ADDRESS,
    associatedWallet: LEGACY_NFT_DEPLOYER_WALLET,
  },
  [NFTSlug.I_VOTED]: {
    contractAddress: I_VOTED_NFT_CONTRACT_ADDRESS,
    associatedWallet: LEGACY_NFT_DEPLOYER_WALLET,
  },
}
