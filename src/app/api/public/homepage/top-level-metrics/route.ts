import 'server-only'

import { NextResponse } from 'next/server'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  const data = await getHomepageTopLevelMetrics()
  return NextResponse.json(data)
}
