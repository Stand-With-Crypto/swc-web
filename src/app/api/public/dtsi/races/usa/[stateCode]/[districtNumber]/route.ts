import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSILocationSpecificRacesInformation } from '@/data/dtsi/queries/queryDTSILocationSpecificRacesInformation'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const zodParams = z.object({
  districtNumber: z.string().pipe(z.coerce.number().int().gte(0).lt(1000)),
  stateCode: z.string().length(2),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ stateCode: string; districtNumber: string }> },
) {
  const params = await props.params
  const { stateCode, districtNumber } = zodParams.parse(params)
  const data = await queryDTSILocationSpecificRacesInformation({
    stateCode,
    district: districtNumber,
  })
  return NextResponse.json(data)
}
