import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { CURRENT_DISTRICT_RANKING } from '@/utils/server/districtRankings/constants'
import { getDistrictRank } from '@/utils/server/districtRankings/upsertRankings'
import { zodStateDistrict } from '@/validation/fields/zodAddress'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ stateCode: string; districtNumber: string }> },
) {
  const params = await props.params
  const { stateCode, districtNumber } = params

  const parseResult = zodStateDistrict.safeParse({ state: stateCode, district: districtNumber })
  if (!parseResult.success) {
    console.log('parseResult', parseResult.error.errors)
    return NextResponse.json({ error: parseResult.error.errors }, { status: 400 })
  }

  const data = await getDistrictRank(CURRENT_DISTRICT_RANKING, {
    state: parseResult.data.state,
    district: parseResult.data.district,
  })

  return NextResponse.json(data)
}

export type GetDistrictRankResponse = Awaited<ReturnType<typeof getDistrictRank>>
