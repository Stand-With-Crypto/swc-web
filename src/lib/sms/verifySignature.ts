import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

import { parseTwilioBody } from '@/lib/sms'

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

  logger.debug({
    signature,
    url,
    rawBody,
    params: parseTwilioBody(rawBody),
    expectedSignature: twilio.getExpectedTwilioSignature(authToken, url, parseTwilioBody(rawBody)),
  })

  return twilio.validateRequest(authToken, signature, url, parseTwilioBody(rawBody))
}
