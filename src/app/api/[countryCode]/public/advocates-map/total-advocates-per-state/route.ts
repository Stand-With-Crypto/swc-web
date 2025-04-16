import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export async function GET(_: NextRequest, { params }: RequestContext) {
  const { countryCode } = await params

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  const data = await getAdvocatesMapData(validatedFields.data)

  return NextResponse.json(data)
}
