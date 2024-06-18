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

  let bodyText = ''
  try {
    bodyText = await request.text()
  } catch (e) {
    logger.error('Error parsing text from request', e)
  }

  const bodyParams = Object.fromEntries(new URLSearchParams(bodyText))

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url,
    expectedSignatureParams: twilio.getExpectedTwilioSignature(authToken, url, bodyParams),
    bodyText,
    bodyParams,
  })

  return twilio.validateRequest(authToken, signature, url, bodyParams)
}
