import { NextRequest, NextResponse } from 'next/server'

import {
  verifiedSWCPartnersGetUserMetadata,
  zodVerifiedSWCPartnersGetUserMetadata,
} from '@/data/verifiedSWCPartners/getUserMetadata'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const partner = await authenticateAndGetVerifiedSWCPartnerFromHeader()
  const validatedFields = zodVerifiedSWCPartnersGetUserMetadata.parse(await request.json())
  const result = await verifiedSWCPartnersGetUserMetadata({
    ...validatedFields,
    partner,
  })
  return NextResponse.json(result)
})
