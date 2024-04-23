import { NextRequest, NextResponse } from 'next/server'

import {
  verifiedSWCPartnersGetUserMetadata,
  zodVerifiedSWCPartnersGetUserMetadata,
} from '@/data/verifiedSWCPartners/getUserMetadata'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

export async function POST(request: NextRequest) {
  const partner = authenticateAndGetVerifiedSWCPartnerFromHeader()
  const validatedFields = zodVerifiedSWCPartnersGetUserMetadata.parse(await request.json())
  const result = await verifiedSWCPartnersGetUserMetadata({
    ...validatedFields,
    partner,
  })
  return NextResponse.json(result)
}
