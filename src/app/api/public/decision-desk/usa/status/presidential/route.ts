import 'server-only'

import { NextResponse } from 'next/server'

import { getPresidentialElectionStatus } from '@/utils/server/decisionDesk/getPresidentialElectionStatus'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const presidentialStatus = await getPresidentialElectionStatus()

  return NextResponse.json(presidentialStatus)
}
