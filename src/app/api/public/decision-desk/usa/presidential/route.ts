import 'server-only'

import { NextResponse } from 'next/server'

import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['15_MINUTES']

export async function GET() {
  const data = await getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>(
    'SWC_PRESIDENTIAL_RACES_DATA',
  )

  return NextResponse.json(data)
}
