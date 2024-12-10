import 'server-only'

import { NextResponse } from 'next/server'

import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'

export async function GET() {
  const data = await getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>(
    'SWC_PRESIDENTIAL_RACES_DATA',
  )

  return NextResponse.json(data)
}
