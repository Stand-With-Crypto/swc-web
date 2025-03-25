import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 0
export const dynamic = 'error'

const zodParams = z.object({
  countryCode: zodSupportedCountryCode,
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ countryCode: SupportedCountryCodes }> },
) {
  const params = await props.params
  const { countryCode } = zodParams.parse(params)

  if (!countryCode) {
    return NextResponse.json(
      { error: 'Country code is required in all-people dtsi route' },
      { status: 400 },
    )
  }

  const data = await queryDTSIAllPeople({ countryCode: countryCode as SupportedCountryCodes })
  return NextResponse.json(data)
}
