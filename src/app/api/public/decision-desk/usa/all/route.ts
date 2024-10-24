import 'server-only'

import { NextResponse } from 'next/server'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const data = await getDecisionDataFromRedis<RacesVotingDataResponse[]>('SWC_ALL_RACES_DATA')

  return NextResponse.json(data)
}
