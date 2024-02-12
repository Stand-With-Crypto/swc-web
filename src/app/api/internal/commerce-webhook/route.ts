import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { authenticatePaymentRequest } from '@/utils/server/coinbaseCommerce/authenticatePaymentRequest'
import {
  CoinbaseCommercePayment,
  zodCoinbaseCommercePayment,
} from '@/utils/server/coinbaseCommerce/paymentRequest'
import { storePaymentRequest } from '@/utils/server/coinbaseCommerce/storePaymentRequest'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()
  authenticatePaymentRequest(rawRequestBody)
  const body = rawRequestBody as CoinbaseCommercePayment
  const zodResult = zodCoinbaseCommercePayment.safeParse(body)
  if (!zodResult.success) {
    Sentry.captureMessage('unexpected Coinbase Commerce payment request format'),
      {
        extra: {
          body,
          errors: zodResult.error.flatten(),
        },
      }
  }

  try {
    getServerAnalytics({
      localUser: parseLocalUserFromCookies(),
      userId: body.event.data.metadata.userId,
    }).track('Coinbase Commerce Payment', {
      paymentExpire: body.event.data.expires_at,
      paymentId: body.id,
      paymentPrice: `${body.event.data.pricing.local.amount} ${body.event.data.pricing.local.currency}`,
      paymentType: body.event.type,
      sessionId: body.event.data.metadata.sessionId,
      userId: body.event.data.metadata.userId,
    })

    // Only store the payment request if the charge has been confirmed.
    if (body.event.type === 'charge:confirmed') {
      await storePaymentRequest(body)
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        id: body.id,
        pricing: body.event.data.pricing,
        sessionId: body.event.data.metadata.sessionId,
      },
    })
    return new NextResponse('internal error', { status: 500 })
  }
  return new NextResponse('success', { status: 200 })
}
