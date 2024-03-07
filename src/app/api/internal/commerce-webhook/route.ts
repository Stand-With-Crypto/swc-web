import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { authenticatePaymentRequest } from '@/utils/server/coinbaseCommerce/authenticatePaymentRequest'
import {
  CoinbaseCommercePayment,
  zodCoinbaseCommercePayment,
} from '@/utils/server/coinbaseCommerce/paymentRequest'
import {
  extractPricingValues,
  storePaymentRequest,
} from '@/utils/server/coinbaseCommerce/storePaymentRequest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser, ServerLocalUser } from '@/utils/server/serverLocalUser'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()

  if (!authenticatePaymentRequest(rawRequestBody)) {
    return new NextResponse('unauthorized', { status: 401 })
  }

  const body = rawRequestBody as CoinbaseCommercePayment
  const zodResult = zodCoinbaseCommercePayment.safeParse(body)
  if (!zodResult.success) {
    // Only capture message, but still attempt to proceed with the request.
    Sentry.captureMessage('unexpected Coinbase Commerce payment request format', {
      extra: {
        body,
        errors: zodResult.error.flatten(),
      },
    })
  }

  let localUser: ServerLocalUser | null = null
  if (body.event.data.metadata.userId) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: body.event.data.metadata.userId,
      },
    })
    if (user) {
      localUser = getLocalUserFromUser(user)
    }
  }
  const analytics = getServerAnalytics({
    localUser,
    userId: body.event.data.metadata.userId,
  })
  try {
    const pricingValues = extractPricingValues(body)

    // Tracking the payment event regardless of type - the donation action is not created here.
    analytics.track('Coinbase Commerce webhook event received', {
      creationMethod: 'On Site',
      paymentExpire: body.event.data.expires_at,
      paymentId: body.id,
      paymentPrice: `${pricingValues.amountUsd} ${SupportedFiatCurrencyCodes.USD}`,
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
      extra: { body },
    })
    return new NextResponse('internal error', { status: 500 })
  } finally {
    await analytics.flush()
  }
  return new NextResponse('success', { status: 200 })
}
