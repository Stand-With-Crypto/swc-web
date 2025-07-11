import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  getZodVerifiedSWCPartnersUserActionOptInSchema,
  verifiedSWCPartnersUserActionOptIn,
} from '@/data/verifiedSWCPartners/userActionOptIn'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

type RequestBody = z.infer<ReturnType<typeof getZodVerifiedSWCPartnersUserActionOptInSchema>>

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const partner = await authenticateAndGetVerifiedSWCPartnerFromHeader()
  const requestBody = await request.json()

  const baseValidationResult = getZodVerifiedSWCPartnersUserActionOptInSchema()
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

  const { countryCode } = baseValidationResult.data

  const phoneNumberValidationResult = getZodVerifiedSWCPartnersUserActionOptInSchema(
    countryCode,
  ).shape.phoneNumber.safeParse((requestBody as RequestBody)?.phoneNumber)

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
    hasValidPhoneNumber: phoneNumberValidationResult.success,
  })

  return NextResponse.json(result)
})
