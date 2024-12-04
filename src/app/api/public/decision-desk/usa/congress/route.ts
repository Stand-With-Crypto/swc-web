import 'server-only'

import { NextResponse } from 'next/server'

import {
  CongressDataResponse,
  GetAllCongressDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'

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
