import 'server-only'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { NextResponse } from 'next/server'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  const data = await getHomepageTopLevelMetrics()
  return NextResponse.json(data)
}
