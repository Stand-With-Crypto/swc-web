import 'server-only'

import { NextResponse } from 'next/server'

import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const data = await getDecisionDataFromRedis<GetAllCongressDataResponse>('SWC_ALL_CONGRESS_DATA')

  return NextResponse.json(data)
}
