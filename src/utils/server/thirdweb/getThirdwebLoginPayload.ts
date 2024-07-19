'use server'

import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'

export async function generateThirdwebLoginPayload(address: string) {
  return thirdwebAuth.generatePayload({ address })
}
