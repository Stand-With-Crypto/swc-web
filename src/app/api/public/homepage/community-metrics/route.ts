import 'server-only'

import { getHomepageCommunityMetrics } from '@/data/pageSpecific/getHomepageData'
import { NextResponse } from 'next/server'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  const data = await getHomepageCommunityMetrics()
  return NextResponse.json(data)
}
