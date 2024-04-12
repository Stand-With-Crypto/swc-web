import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'
import { createThirdwebClient, defineChain, encode, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { claimTo } from 'thirdweb/extensions/erc721'

import { I_AM_A_VOTER_NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/constants'
import { ERC_721_CONTRACT_ABI } from '@/utils/server/thirdweb/erc721ClaimABI'
import { THIRD_WEB_CLIENT_SECRET } from '@/utils/server/thirdweb/thirdwebClientSecret'
import { NEYNAR_API_KEY } from '@/utils/shared/neynarAPIKey'

const BASE_CHAIN_ID = '8453'

export async function POST(req: NextRequest): Promise<Response> {
  const body: FrameRequest = (await req.json()) as FrameRequest
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: NEYNAR_API_KEY }) // NOTE: Frame state data does not exist on localhost.
  if (!isValid || !message)
    return NextResponse.json({ error: 'invalid frame message' }, { status: 400 })

  const walletAddress =
    message.interactor?.verified_accounts[0] ?? message.interactor?.custody_address
  if (!walletAddress) return NextResponse.json({ error: 'no account address' }, { status: 400 })

  // We use this thirdweb client instead of our existing viem client because
  // the thirdweb client makes it super easy to interact with thirdweb smart contracts.
  const twClient = createThirdwebClient({ secretKey: THIRD_WEB_CLIENT_SECRET })
  const twChain = defineChain(base)

  const contract = getContract({
    client: twClient,
    chain: twChain,
    address: I_AM_A_VOTER_NFT_CONTRACT_ADDRESS,
  })

  const tx = claimTo({
    contract,
    to: walletAddress,
    quantity: BigInt(1),
  })

  const encodedTx = await encode(tx)

  return NextResponse.json({
    chainId: `eip155:${BASE_CHAIN_ID}`,
    method: 'eth_sendTransaction',
    params: {
      abi: ERC_721_CONTRACT_ABI,
      to: I_AM_A_VOTER_NFT_CONTRACT_ADDRESS,
      data: encodedTx,
      value: '0',
    },
  })
}
