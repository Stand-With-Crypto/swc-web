import 'server-only'

import { NextResponse } from 'next/server'

import {
  CongressDataResponse,
  GetAllCongressDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const [allSenateData, allHouseData] = await Promise.allSettled([
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_SENATE_DATA'),
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_HOUSE_DATA'),
  ])

  const congressRaceLiveResult: GetAllCongressDataResponse = {
    senateDataWithDtsi: allSenateData.status === 'fulfilled' ? allSenateData.value : null,
    houseDataWithDtsi: allHouseData.status === 'fulfilled' ? allHouseData.value : null,
  }

  return NextResponse.json(congressRaceLiveResult)
}
