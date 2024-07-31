import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_WEBHOOK_VERIFICATION_KEY = requiredOutsideLocalEnv(
  process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY,
  'SENDGRID_WEBHOOK_VERIFICATION_KEY',
  'Sendgrid Events Webhook',
)

export async function verifySignature(request: Request) {
  if (!SENDGRID_WEBHOOK_VERIFICATION_KEY) {
    return false
  }

  const signature = request.headers.get(EventWebhookHeader.SIGNATURE())
  const timestamp = request.headers.get(EventWebhookHeader.TIMESTAMP())

  if (!timestamp || !signature) {
    throw new Error('Sendgrid webhook: missing verification headers')
  }

  const eventWebhook = new EventWebhook()
  const payload = await request.text()
  const ecdsaPublicKey = eventWebhook.convertPublicKeyToECDSA(SENDGRID_WEBHOOK_VERIFICATION_KEY)
  return eventWebhook.verifySignature(ecdsaPublicKey, payload, signature, timestamp)
}
