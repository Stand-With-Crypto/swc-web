import 'server-only'

import { NextResponse } from 'next/server'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: string
  }>
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params
  const data = await getHomepageTopLevelMetrics({ countryCode })
  return NextResponse.json(data)
}
