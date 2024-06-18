import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  const url = request.url
  const rawBody = await request.text()

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    authToken,
    signature,
    url,
    expectedSignatureParams: twilio.getExpectedTwilioSignature(
      authToken,
      url,
      normalizeBody(rawBody),
    ),
    normalizeBody: normalizeBody(rawBody),
    rawBody,
  })

  return twilio.validateRequest(authToken, signature, url, normalizeBody(rawBody))
}

export function normalizeBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body)

  params.sort()

  return Object.fromEntries(params)
}
