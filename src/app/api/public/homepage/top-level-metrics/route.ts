import 'server-only'

import { NextResponse } from 'next/server'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

export async function GET() {
  const data = await getHomepageTopLevelMetrics()
  return NextResponse.json(data)
}
