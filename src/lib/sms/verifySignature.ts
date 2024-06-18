import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  const bodyParams = (await request.json()) as Record<string, string>
  const textBody = await request.text()
  const objectBody = JSON.parse(textBody) as Record<string, string>
  const url = request.url

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url,
    expectedSignatureJSON: twilio.getExpectedTwilioSignature(authToken, url, bodyParams),
    expectedSignatureText: twilio.getExpectedTwilioSignature(authToken, url, objectBody),
    bodyParams,
    textBody,
    objectBody,
  })

  return twilio.validateRequest(authToken, signature, url, bodyParams)
}
