import 'server-only'

import { NextResponse } from 'next/server'

import { getSumDonations } from '@/data/aggregations/getSumDonations'
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

  const data = await getSumDonations({ countryCode })
  return NextResponse.json(data)
}
