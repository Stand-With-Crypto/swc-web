import 'server-only'

import { NextResponse } from 'next/server'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.SECOND * 30

export async function GET() {
  const data = await getHomepageTopLevelMetrics()
  return NextResponse.json(data)
}
