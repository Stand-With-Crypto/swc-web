import 'server-only'

import { NextResponse } from 'next/server'

import { getHomepageTopLevelMetrics } from '@/data/pageSpecific/getHomepageData'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: string
  }>
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params

  zodSupportedCountryCode.parse(countryCode)

  const data = await getHomepageTopLevelMetrics({ countryCode })
  return NextResponse.json(data)
}
