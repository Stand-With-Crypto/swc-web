import { NextRequest, NextResponse } from 'next/server'
import { authenticatePaymentRequest } from '@/utils/server/coinbaseCommerce/authenticatePaymentRequest'
import * as Sentry from '@sentry/nextjs'
import { storePaymentRequest } from '@/utils/server/coinbaseCommerce/storePaymentRequest'
import { CoinbaseCommercePayment } from '@/utils/server/coinbaseCommerce/paymentRequest'
import { prettyLog } from '@/utils/shared/prettyLog'

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()
  authenticatePaymentRequest(rawRequestBody)
  try {
    const body = rawRequestBody as CoinbaseCommercePayment
    prettyLog(body)
    // Only store the payment request if the charge has been confirmed.
    if (body.event.type === 'charge:confirmed') {
      storePaymentRequest(body)
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        id: (rawRequestBody as CoinbaseCommercePayment).id,
        pricing: (rawRequestBody as CoinbaseCommercePayment).event.data.pricing,
        sessionId: (rawRequestBody as CoinbaseCommercePayment).event.data.metadata.sessionId,
      },
    })
    return new NextResponse('internal error', { status: 500 })
  }
  return new NextResponse('success', { status: 200 })
}
