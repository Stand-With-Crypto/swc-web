import { NextRequest, NextResponse } from 'next/server'

import {
  verifiedSWCPartnersGetUserMetadata,
  zodVerifiedSWCPartnersGetUserMetadata,
} from '@/data/verifiedSWCPartners/getUserMetadata'
import { withUserSession } from '@/utils/server/serverWrappers/withUserSession'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

export const POST = withUserSession(async (request: NextRequest) => {
  const partner = authenticateAndGetVerifiedSWCPartnerFromHeader()
  const validatedFields = zodVerifiedSWCPartnersGetUserMetadata.parse(await request.json())
  const result = await verifiedSWCPartnersGetUserMetadata({
    ...validatedFields,
    partner,
  })
  return NextResponse.json(result)
})
