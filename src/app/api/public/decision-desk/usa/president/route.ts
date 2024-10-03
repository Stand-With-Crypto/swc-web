import 'server-only'

import { NextResponse } from 'next/server'

import { fetchElectoralCollege } from '@/data/decisionDesk/services'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['2_MINUTES']

export async function GET() {
  const data = await fetchElectoralCollege()

  return NextResponse.json(data)
}
