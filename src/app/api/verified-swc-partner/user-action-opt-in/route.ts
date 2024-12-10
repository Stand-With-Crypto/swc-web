import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  verifiedSWCPartnersUserActionOptIn,
  zodVerifiedSWCPartnersUserActionOptIn,
} from '@/data/verifiedSWCPartners/userActionOptIn'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

type RequestBody = z.infer<typeof zodVerifiedSWCPartnersUserActionOptIn>

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const partner = await authenticateAndGetVerifiedSWCPartnerFromHeader()
  const requestBody = await request.json()

  const baseValidationResult = zodVerifiedSWCPartnersUserActionOptIn
    .omit({ phoneNumber: true })
    .safeParse(requestBody)

  if (!baseValidationResult.success) {
    Sentry.captureException(baseValidationResult.error, {
      extra: {
        partner,
        requestBody,
      },
    })
    return NextResponse.json({ error: baseValidationResult.error }, { status: 400 })
  }

  const phoneNumberValidationResult =
    zodVerifiedSWCPartnersUserActionOptIn.shape.phoneNumber.safeParse(
      (requestBody as RequestBody)?.phoneNumber,
    )

  let validatedFields: RequestBody = baseValidationResult.data as RequestBody

  if (!phoneNumberValidationResult.success) {
    Sentry.captureException(phoneNumberValidationResult.error, {
      extra: {
        partner,
        requestBody,
      },
      level: 'warning',
    })
    validatedFields = { ...validatedFields, phoneNumber: (requestBody as RequestBody)?.phoneNumber }
  } else {
    validatedFields = { ...validatedFields, phoneNumber: phoneNumberValidationResult.data }
  }

  const result = await verifiedSWCPartnersUserActionOptIn({
    ...validatedFields,
    partner,
  })

  return NextResponse.json(result)
})
