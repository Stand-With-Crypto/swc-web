import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSILocationSpecificRacesInformation } from '@/data/dtsi/queries/queryDTSILocationSpecificRacesInformation'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR

const zodParams = z.object({
  districtNumber: z.string().pipe(z.coerce.number().int().gte(0).lt(1000)),
  stateCode: z.string().length(2),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { stateCode: string; districtNumber: string } },
) {
  const { stateCode, districtNumber } = zodParams.parse(params)
  const data = await queryDTSILocationSpecificRacesInformation({
    stateCode,
    district: districtNumber,
  })
  return NextResponse.json(data)
}
