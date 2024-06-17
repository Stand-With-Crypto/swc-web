import twilio from 'twilio'

const authToken = process.env.TWILIO_AUTH_TOKEN

export async function verifySignature(request: Request) {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const signature = request.headers.get('X-Twilio-Signature')
  const params = new URLSearchParams(await request.text())

  if (!signature) {
    throw new Error('Missing verification headers')
  }

  return twilio.validateRequest(authToken, signature, request.url, params)
}
