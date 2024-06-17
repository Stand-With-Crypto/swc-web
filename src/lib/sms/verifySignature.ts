import twilio from 'twilio'

import { getLogger } from '@/utils/shared/logger'

const authToken = process.env.TWILIO_AUTH_TOKEN

const logger = getLogger('verifySignature')

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  const params = new URLSearchParams(await request.text())

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  logger.info('Verifying Twilio signature', {
    signature,
    url: request.url,
    paramsRaw: params,
    params: Object.fromEntries(params),
  })

  return twilio.validateRequest(authToken, signature, request.url, params)
}
