import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  verifiedSWCPartnersUserActionViewKeyRaces,
  zodVerifiedSWCPartnersUserActionViewKeyRaces,
} from '@/data/verifiedSWCPartners/userActionViewKeyRaces'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

type RequestBody = z.infer<typeof zodVerifiedSWCPartnersUserActionViewKeyRaces>

export async function POST(request: NextRequest) {
  const partner = await authenticateAndGetVerifiedSWCPartnerFromHeader()
  const requestBody = await request.json()

  const baseValidationResult = zodVerifiedSWCPartnersUserActionViewKeyRaces.safeParse(requestBody)

  if (!baseValidationResult.success) {
    Sentry.captureException(baseValidationResult.error, {
      extra: {
        partner,
        requestBody,
      },
    })
    return NextResponse.json({ error: baseValidationResult.error }, { status: 400 })
  }

  const validatedFields: RequestBody = baseValidationResult.data as RequestBody

  const result = await verifiedSWCPartnersUserActionViewKeyRaces({
    ...validatedFields,
    partner,
  })

  return NextResponse.json(result)
}
