import 'server-only'

import { NextResponse } from 'next/server'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export const GET = async (_: Request, { params }: RequestContext) => {
  const { countryCode } = await params

  const data = await getAdvocatesMapData({ countryCode })

  return NextResponse.json(data)
}
