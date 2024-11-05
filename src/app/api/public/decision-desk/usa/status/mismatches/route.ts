import 'server-only'

import { NextResponse } from 'next/server'

import { getCandidatesMismatches } from '@/utils/server/decisionDesk/getCandidatesMismatches'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const candidatesMismatches = await getCandidatesMismatches()

  return NextResponse.json(candidatesMismatches)
}
