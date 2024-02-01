import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { headers } from 'next/headers'
import { prettyLog } from '@/utils/shared/prettyLog'

const COINBASE_COMMERCE_WEBHOOK_SECRET = requiredEnv(
  process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  'process.env.COINBASE_COMMERCE_WEBHOOK_SECRET',
)

export async function POST(request: NextRequest) {
  // Performing signature verification here because both signature verification and subsequent mutations require the
  // request body to be consumed as a stream, and we can't consume the request body more than once.
  const requestBody = await request.json()
  const headerSignature = headers().get('x-cc-webhook-signature')
  if (!headerSignature) {
    throw new Error('no signature header provided')
  }
  const constructedSignature = crypto
    .createHmac('sha256', COINBASE_COMMERCE_WEBHOOK_SECRET)
    .update(JSON.stringify(requestBody), 'utf8')
    .digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(constructedSignature), Buffer.from(headerSignature))) {
    return new NextResponse('unauthorized', { status: 401 })
  }

  try {
    prettyLog(requestBody)

    // TODO (Benson): Record donation in database.
  } catch (error) {
    console.log('Error processing commerce webhook:', error)
    return new NextResponse('internal error', { status: 500 })
  }

  return new NextResponse('success', { status: 200 })
}
