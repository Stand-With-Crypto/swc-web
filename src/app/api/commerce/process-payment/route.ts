import { prettyLog } from '@/utils/shared/prettyLog'
import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const COINBASE_COMMERCE_WEBHOOK_SECRET = requiredEnv(
  process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  'process.env.COINBASE_COMMERCE_WEBHOOK_SECRET',
)

const verifyCommerceWebhookSignature = (request: NextRequest) => {
  const signature = crypto
    .createHmac('sha256', COINBASE_COMMERCE_WEBHOOK_SECRET)
    .update(JSON.stringify(request.body))
    .digest('hex')
  const trusted = Buffer.from(`${signature}`, 'ascii')
  const untrusted = Buffer.from(request.headers.get('X-CC-Webhook-Signature') || '', 'ascii')
  return crypto.timingSafeEqual(trusted, untrusted)
}

export async function POST(request: NextRequest) {
  if (!verifyCommerceWebhookSignature(request)) {
    return new NextResponse('unauthorized', { status: 401 })
  }
  try {
    const text = await request.text()
    prettyLog(text)

    // TODO (Benson): Record donation in database.
  } catch (error) {
    return new NextResponse('internal error', { status: 500 })
  }

  return new NextResponse('success', { status: 200 })
}
