import * as Sentry from '@sentry/nextjs'
import crypto from 'crypto'
import { headers } from 'next/headers'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const COINBASE_COMMERCE_WEBHOOK_SECRET = requiredEnv(
  process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  'process.env.COINBASE_COMMERCE_WEBHOOK_SECRET',
)

function areSignaturesEqual(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

// The below argument is left as any because we want to be able to accept any raw request body.
export async function authenticatePaymentRequest(rawRequestBody: any) {
  const currentHeaders = await headers()
  const headerSignature = currentHeaders.get('x-cc-webhook-signature')
  if (!headerSignature) {
    Sentry.captureMessage('missing signature within request header', {
      extra: { body: rawRequestBody },
    })
    return false
  }
  const constructedSignature = crypto
    .createHmac('sha256', COINBASE_COMMERCE_WEBHOOK_SECRET)
    .update(JSON.stringify(rawRequestBody), 'utf8')
    .digest('hex')
  if (!areSignaturesEqual(constructedSignature, headerSignature)) {
    Sentry.captureMessage('invalid signature within request header', {
      extra: { body: rawRequestBody },
    })
    return false
  }
  return true
}
