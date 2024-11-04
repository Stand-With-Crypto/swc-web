import 'server-only'

import { NextResponse } from 'next/server'

import { getCongressElectionStatus } from '@/utils/server/decisionDesk/getCongressElectionStatus'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const congressElectionStatus = await getCongressElectionStatus()

  return NextResponse.json(congressElectionStatus)
}
