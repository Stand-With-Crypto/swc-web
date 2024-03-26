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
const AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS = '0xd9C77be238F858b3d08eF87202c624D520663920'

const AIRDROP_GAS_LIMIT_OE721_CONTRACT = 190000 // This is based on the used gas limit of existing transactions from our airdropping wallets.

export async function fetchAirdropTransactionFee(): Promise<number> {
  globalThis.TW_SKIP_FETCH_SETUP = true
  const sdk = ThirdwebSDK.fromPrivateKey(AIRDROP_FEE_ESTIMATION_WALLET_PRIVATE_KEY, 'base', {
    secretKey: THIRD_WEB_CLIENT_SECRET,
  })
  const contract = await sdk.getContract(AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS)
  const transaction = await contract.erc721.claim.prepare(1)
  transaction.updateOverrides({ gasLimit: AIRDROP_GAS_LIMIT_OE721_CONTRACT })
  const gasCost = await transaction.estimateGasCost()
  return Number(gasCost.ether)
}
