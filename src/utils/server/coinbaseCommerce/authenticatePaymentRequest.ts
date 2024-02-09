import * as Sentry from '@sentry/nextjs'
import crypto from 'crypto'
import { headers } from 'next/headers'

import { CoinbaseCommercePayment } from '@/utils/server/coinbaseCommerce/paymentRequest'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const COINBASE_COMMERCE_WEBHOOK_SECRET = requiredEnv(
  process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  'process.env.COINBASE_COMMERCE_WEBHOOK_SECRET',
)

function areSignaturesEqual(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch (e) {
    return false
  }
}

// The below argument is left as any because we want to be able to accept any raw request body.
export function authenticatePaymentRequest(rawRequestBody: any) {
  const headerSignature = headers().get('x-cc-webhook-signature')
  if (!headerSignature) {
    Sentry.captureMessage('missing signature within request header', {
      extra: { id: (rawRequestBody as CoinbaseCommercePayment).id },
    })
    throw new Error('unauthorized')
  }
  const constructedSignature = crypto
    .createHmac('sha256', COINBASE_COMMERCE_WEBHOOK_SECRET)
    .update(JSON.stringify(rawRequestBody), 'utf8')
    .digest('hex')
  if (!areSignaturesEqual(constructedSignature, headerSignature)) {
    Sentry.captureMessage('invalid signature within request header', {
      extra: { id: (rawRequestBody as CoinbaseCommercePayment).id, headerSignature },
    })
    throw new Error('unauthorized')
  }
  return true
}
