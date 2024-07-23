'use server'

import { base } from 'thirdweb/chains'

import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'

export async function generateThirdwebLoginPayload(address: string) {
  return thirdwebAuth.generatePayload({ address, chainId: base.id })
}
