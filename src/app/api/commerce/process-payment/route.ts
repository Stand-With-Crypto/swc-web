import { NextRequest, NextResponse } from 'next/server'
import { authenticatePaymentRequest } from '@/utils/server/coinbaseCommerce/authenticatePaymentRequest'
import * as Sentry from '@sentry/nextjs'
import { storePaymentRequest } from '@/utils/server/coinbaseCommerce/storePaymentRequest'
import { CoinbaseCommercePayment } from '@/utils/server/coinbaseCommerce/paymentRequest'

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()
  authenticatePaymentRequest(rawRequestBody)
  try {
    const body = rawRequestBody as CoinbaseCommercePayment
    storePaymentRequest(body)
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        id: (rawRequestBody as CoinbaseCommercePayment).id,
        pricing: (rawRequestBody as CoinbaseCommercePayment).event.data.pricing,
      },
    })
    return new NextResponse('internal error', { status: 500 })
  }
  return new NextResponse('success', { status: 200 })
}
