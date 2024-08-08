import { NextRequest } from 'next/server'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const CAPITOL_CANARY_WEBHOOK_SECRET = requiredEnv(
  process.env.CAPITOL_CANARY_WEBHOOK_SECRET,
  'Capitol Canary webhook secret',
)

export function authenticateCapitolCanaryRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization')

  if (!authorization || authorization !== CAPITOL_CANARY_WEBHOOK_SECRET) {
    return false
  }

  return true
}
