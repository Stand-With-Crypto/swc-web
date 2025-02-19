import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { CURRENT_DISTRICT_RANKING } from '@/utils/server/districtRankings/constants'
import { getDistrictRankPosition } from '@/utils/server/districtRankings/upsertRankings'
import { zodStateDistrict } from '@/validation/fields/zodAddress'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

const zodParams = zodStateDistrict

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const district = searchParams.get('district')

  if (!state || !district) {
    return NextResponse.json(
      { error: 'State and district parameters are required' },
      { status: 400 },
    )
  }

  const parseResult = zodParams.safeParse({ state, district })
  if (!parseResult.success) {
    console.log('parseResult', parseResult.error.errors)
    return NextResponse.json({ error: parseResult.error.errors }, { status: 400 })
  }

  const data = await getDistrictRankPosition(CURRENT_DISTRICT_RANKING, {
    state: parseResult.data.state,
    district: parseResult.data.district,
  })

  console.log('data', data)

  return NextResponse.json(data)
}
