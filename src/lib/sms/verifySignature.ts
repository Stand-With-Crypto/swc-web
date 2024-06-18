import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  const params = Object.fromEntries(new URL(request.url).searchParams)
  const url = request.url

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url,
    params,
    expectedSignature: twilio.getExpectedTwilioSignature(authToken, url, params),
  })

  return twilio.validateRequest(authToken, signature, url, params)
}
