import { estimateGasCost, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { claimTo } from 'thirdweb/extensions/erc721'
import { generateAccount } from 'thirdweb/wallets'

import { thirdwebClient } from '@/utils/shared/thirdwebClient'

// This is our SWC testing NFT contract address, but because its claim conditions are public, we can use this contract address to check the current transaction fees of the Base network.
const AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS = '0xd9C77be238F858b3d08eF87202c624D520663920'

export async function fetchAirdropTransactionFee(): Promise<number> {
  const contract = getContract({
    client: thirdwebClient,
    address: AIRDROP_FEE_ESTIMATION_CONTRACT_ADDRESS,
    chain: base,
  })

  const fakeDestinationAccount = await generateAccount({ client: thirdwebClient })

  const tx = claimTo({
    contract: contract,
    quantity: BigInt(1),
    to: fakeDestinationAccount.address,
  })
  const gasFee = await estimateGasCost({ transaction: tx })

  return Number(gasFee.ether)
}
