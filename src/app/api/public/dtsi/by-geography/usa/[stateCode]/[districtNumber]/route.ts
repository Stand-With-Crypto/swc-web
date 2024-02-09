import 'server-only'

import { queryDTSIPeopleByCongressionalDistrict } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'error'
export const revalidate = 60 * 60 * 24

const zodParams = z.object({
  districtNumber: z.string().pipe(z.coerce.number().int().gte(0).lt(1000)),
  stateCode: z.string().length(2),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { stateCode: string; districtNumber: string } },
) {
  const { stateCode, districtNumber } = zodParams.parse(params)
  const data = await queryDTSIPeopleByCongressionalDistrict({
    stateCode,
    districtNumber,
  })
  return NextResponse.json(data)
}
