import 'server-only'

import { NextResponse } from 'next/server'

import { getElectedCandidates } from '@/utils/server/decisionDesk/getElectedCandidates'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.MINUTE

export async function GET() {
  const electedCandidates = await getElectedCandidates()

  return NextResponse.json(electedCandidates)
}
