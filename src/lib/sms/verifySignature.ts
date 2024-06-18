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
  const bodyParams = Object.fromEntries(new URLSearchParams(await request.text()))
  const url = request.url

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url,
    params,
    expectedSignature: twilio.getExpectedTwilioSignature(authToken, url, bodyParams),
    bodyParams,
  })

  return twilio.validateRequest(authToken, signature, url, bodyParams)
}
