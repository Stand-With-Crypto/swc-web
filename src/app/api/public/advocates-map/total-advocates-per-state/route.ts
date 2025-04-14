import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

export async function GET(request: NextRequest) {
  const countryCode = request.nextUrl.searchParams.get('countryCode') as SupportedCountryCodes
  const data = await getAdvocatesMapData(countryCode)

  return NextResponse.json(data)
}
