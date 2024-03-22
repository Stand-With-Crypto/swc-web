import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import {
  createInAppCharge,
  CreateChargeParams,
  CoinbaseCommerceDonation,
  zodCoinbaseCommerceDonation
} from '@/utils/server/coinbaseCommerce/createCharge'

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()

  const body = rawRequestBody as CoinbaseCommerceDonation
  const zodResult = zodCoinbaseCommerceDonation.safeParse(body)
  if (!zodResult.success) {
    // Only capture message, but still attempt to proceed with the request.
    Sentry.captureMessage('unexpected Coinbase Commerce donation request format', {
      extra: {
        body,
        errors: zodResult.error.flatten(),
      },
    })
  }
  const params: CreateChargeParams = {
    address: body.address,
    email: body.email,
    employer: body.employer,
    full_name: body.full_name,
    is_citizen: body.is_citizen,
    occupation: body.occupation,
  }
  const hostedUrl = (
    await createInAppCharge({
      createChargeParams: params,
    })
  ).data.hosted_url

  return new NextResponse(JSON.stringify({ charge_url: hostedUrl }), { status: 200 })
}
