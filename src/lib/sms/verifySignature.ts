import twilio from 'twilio'

const authToken = process.env.TWILIO_AUTH_TOKEN

export async function verifySignature<Body = unknown>(request: Request): Promise<[boolean, Body]> {
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

  return [twilio.validateRequest(authToken, signature, url, params), params as Body]
}

export function parseTwilioBody(params: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(params))
}
