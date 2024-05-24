import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'
import { queryDTSIBillRelationshipByPerson } from '@/data/dtsi/queries/queryDTSIBillRelationshipByPerson'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR

const zodParams = z.object({
  slug: zodDTSISlug,
  billId: z.string(),
})

export type BillVoteResult =
  | `${DTSI_BillPersonRelationshipType.VOTED_FOR}`
  | `${DTSI_BillPersonRelationshipType.VOTED_AGAINST}`
  | 'NO_VOTE'

async function apiResponseForBillVoteByPerson(
  params: z.infer<typeof zodParams>,
): Promise<BillVoteResult> {
  const data = await queryDTSIBillRelationshipByPerson({
    billId: params.billId,
    personSlug: params.slug,
  })

  if (!data?.relationshipType) {
    return 'NO_VOTE'
  }

  return data.relationshipType === DTSI_BillPersonRelationshipType.VOTED_AGAINST
    ? 'VOTED_AGAINST'
    : 'VOTED_FOR'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: z.infer<typeof zodParams> },
) {
  const data = await apiResponseForBillVoteByPerson(params)
  console.log({ data })
  return NextResponse.json(data)
}
