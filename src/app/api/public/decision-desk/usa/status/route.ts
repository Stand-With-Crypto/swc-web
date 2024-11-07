import 'server-only'

import { NextResponse } from 'next/server'

import {
  AllCompletedRacesResponse,
  getElectionStatus,
} from '@/utils/server/decisionDesk/getElectionStatus'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['15_MINUTES']

export async function GET() {
  const allCompletedRaces: AllCompletedRacesResponse = await getElectionStatus()

  return NextResponse.json(allCompletedRaces)
}
