import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  let bodyJSON: Record<string, string> = {}
  try {
    bodyJSON = (await request.json()) as Record<string, string>
  } catch (e) {
    logger.error('Error parsing JSON from request', e)
  }

  let bodyText = ''
  try {
    bodyText = await request.text()
  } catch (e) {
    logger.error('Error parsing text from request', e)
  }

  const bodyParams = Object.fromEntries(new URLSearchParams(bodyText))
  const url = request.url

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url,
    expectedSignatureJSON: twilio.getExpectedTwilioSignature(authToken, url, bodyJSON),
    expectedSignatureParams: twilio.getExpectedTwilioSignature(authToken, url, bodyParams),
    bodyJSON,
    bodyText,
    bodyParams,
  })

  return twilio.validateRequest(authToken, signature, url, bodyParams)
}
