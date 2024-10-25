import 'server-only'

import { NextResponse } from 'next/server'

import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const allSenateData =
    await getDecisionDataFromRedis<Pick<GetAllCongressDataResponse, 'senateDataWithDtsi'>>(
      'SWC_ALL_SENATE_DATA',
    )
  const allHouseData =
    await getDecisionDataFromRedis<Pick<GetAllCongressDataResponse, 'houseDataWithDtsi'>>(
      'SWC_ALL_HOUSE_DATA',
    )

  return NextResponse.json({
    ...allSenateData,
    ...allHouseData,
  })
}
