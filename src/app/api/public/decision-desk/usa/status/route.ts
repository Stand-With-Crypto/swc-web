import 'server-only'

import { NextResponse } from 'next/server'

import {
  AllCompletedRacesResponse,
  getElectionStatus,
} from '@/utils/server/decisionDesk/getElectionStatus'

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'

export async function GET() {
  const allCompletedRaces: AllCompletedRacesResponse = await getElectionStatus()

  return NextResponse.json(allCompletedRaces)
}
