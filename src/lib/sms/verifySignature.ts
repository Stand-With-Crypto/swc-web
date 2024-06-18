import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  if (!signature) {
    throw new Error('Missing verification headers')
  }

  const url = request.url
  const rawBody = await request.text()
  const params = parseTwilioBody(rawBody)

  logger.debug({
    signature,
    url,
    rawBody,
    params,
    expectedSignature: twilio.getExpectedTwilioSignature(authToken, url, params),
  })

  return [twilio.validateRequest(authToken, signature, url, params), params]
}

export function parseTwilioBody(params: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(params))
}
