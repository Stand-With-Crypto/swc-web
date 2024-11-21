import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesParamsSchema } from '@/utils/server/decisionDesk/schemas'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['15_MINUTES']

export async function GET(
  _request: NextRequest,
  { params }: { params: { state: string; district: string } },
) {
  const { state, district } = GetRacesParamsSchema.parse(params)

  if (!state && !district) {
    return NextResponse.json(
      {
        error: 'State and district are required',
      },
      {
        status: 404,
      },
    )
  }

  const data = await getDecisionDataFromRedis<RacesVotingDataResponse[]>(
    `SWC_${state?.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
  )

  if (!data) {
    return NextResponse.json(
      {
        error: 'Data not found',
      },
      { status: 404 },
    )
  }

  const dataFilteredByItsDistrict = data.filter(
    currentData => currentData.district?.toLowerCase() === district?.toLowerCase(),
  )

  if (!dataFilteredByItsDistrict.length && state?.toUpperCase() !== 'GU') {
    return NextResponse.json(
      {
        error: 'Data not found',
      },
      {
        status: 404,
      },
    )
  }

  return NextResponse.json(dataFilteredByItsDistrict)
}
