import crypto from 'crypto'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const POSTGRID_WEBHOOK_SECRET = requiredOutsideLocalEnv(
  process.env.POSTGRID_WEBHOOK_SECRET,
  'POSTGRID_WEBHOOK_SECRET',
  'PostGrid Webhook Verification',
)

export function verifyPostgridWebhookSignature(
  signature: string | null,
  payload: string,
): boolean {
  if (!POSTGRID_WEBHOOK_SECRET) {
    return false
  }

  if (!signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', POSTGRID_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

