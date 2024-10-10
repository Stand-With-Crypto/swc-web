import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesParamsSchema } from '@/utils/server/decisionDesk/schemas'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET(_request: NextRequest, { params }: { params: { state: string } }) {
  const { state } = GetRacesParamsSchema.parse(params)

  if (!state) {
    return NextResponse.json({
      status: 500,
      error: 'State is required',
    })
  }

  const data = await getDecisionDataFromRedis<RacesVotingDataResponse>(
    `SWC_${state.toUpperCase() as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP}_STATE_RACES_DATA`,
  )

  if (!data) {
    return NextResponse.json({
      status: 404,
      error: 'Data not found',
    })
  }

  return NextResponse.json(data)
}
