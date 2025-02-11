import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'
import { queryDTSIBillRelationshipByPerson } from '@/data/dtsi/queries/queryDTSIBillRelationshipByPerson'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  props: { params: Promise<z.infer<typeof zodParams>> },
) {
  const params = await props.params
  const data = await apiResponseForBillVoteByPerson(params)
  return NextResponse.json(data)
}
