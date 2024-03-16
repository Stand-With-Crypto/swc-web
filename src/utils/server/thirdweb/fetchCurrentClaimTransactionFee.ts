import { ThirdwebSDK } from '@thirdweb-dev/sdk'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRD_WEB_CLIENT_SECRET = requiredEnv(
  process.env.THIRD_WEB_CLIENT_SECRET,
  'process.env.THIRD_WEB_CLIENT_SECRET',
)

const AIRDROP_FEE_ESTIMATION_WALLET_PRIVATE_KEY = requiredEnv(
  process.env.AIRDROP_FEE_ESTIMATION_WALLET_PRIVATE_KEY,
  'process.env.AIRDROP_FEE_ESTIMATION_WALLET_PRIVATE_KEY',
)

declare module globalThis {
  let TW_SKIP_FETCH_SETUP: boolean
}

// This is our SWC testing NFT contract address, but because its claim conditions are public, we can use this contract address to check the current transaction fees of the Base network.
const AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS = '0xd9c77be238f858b3d08ef87202c624d520663920'

const CLAIM_GAS_LIMIT_OE721_CONTRACT = 231086

export async function fetchAirdropTransactionFee(): Promise<string> {
  globalThis.TW_SKIP_FETCH_SETUP = true
  const sdk = ThirdwebSDK.fromPrivateKey(AIRDROP_FEE_ESTIMATION_WALLET_PRIVATE_KEY, 'base', {
    secretKey: THIRD_WEB_CLIENT_SECRET,
  })
  const contract = await sdk.getContract(AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS)
  const transaction = await contract.erc721.claim.prepare(1)
  transaction.updateOverrides({ gasLimit: CLAIM_GAS_LIMIT_OE721_CONTRACT })
  const gasCost = await transaction.estimateGasCost()
  return gasCost.ether
}
