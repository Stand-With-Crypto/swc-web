import { NextRequest, NextResponse } from 'next/server'

import {
  verifiedSWCPartnersGetUserMetadata,
  zodVerifiedSWCPartnersGetUserMetadata,
} from '@/data/verifiedSWCPartners/getUserMetadata'
import { authenticateAndGetVerifiedSWCPartnerFromHeader } from '@/utils/server/verifiedSWCPartner/getVerifiedSWCPartnerFromHeader'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params: { emailAddress } }: { params: { emailAddress: string } },
) {
  const partner = authenticateAndGetVerifiedSWCPartnerFromHeader()
  const validatedFields = zodVerifiedSWCPartnersGetUserMetadata.parse({ emailAddress })
  const result = await verifiedSWCPartnersGetUserMetadata({
    ...validatedFields,
    partner,
  })
  return NextResponse.json(result)
}
