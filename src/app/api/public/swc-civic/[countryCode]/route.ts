import { NextResponse } from 'next/server'

import {
  getAUFederalElectoralDistrict,
  getCAElectoralDistrict,
  getUKParliamentaryConstituency,
  getUSCongressionalDistrict,
} from '@/utils/server/swcCivic/getConstituencyQueries'
import { GetConstituencyQuery } from '@/utils/server/swcCivic/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'
import { getLatLongFromAddress } from '@/utils/server/getLatLongFromAddress'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

const COUNTRY_CODE_TO_CONSTITUENCY_QUERY_MAP: Record<SupportedCountryCodes, GetConstituencyQuery> =
  {
    [SupportedCountryCodes.US]: getUSCongressionalDistrict,
    [SupportedCountryCodes.CA]: getCAElectoralDistrict,
    [SupportedCountryCodes.GB]: getUKParliamentaryConstituency,
    [SupportedCountryCodes.AU]: getAUFederalElectoralDistrict,
  }

export const GET = async (req: Request, { params }: RequestContext) => {
  const { countryCode } = await params

  const url = new URL(req.url)
  const address = url.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  let latitude: number | null = null
  let longitude: number | null = null

  try {
    const { lat, lng } = await getLatLongFromAddress(address)

    latitude = lat
    longitude = lng
  } catch (error) {
    // TODO: maybe add a code to the error
    return NextResponse.json({ error: 'Unable to get latitude and longitude' }, { status: 400 })
  }

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)
  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }
  const validatedCountryCode = validatedFields.data

  const getConstituencyQuery = COUNTRY_CODE_TO_CONSTITUENCY_QUERY_MAP[validatedCountryCode]

  const constituency = await getConstituencyQuery({
    latitude,
    longitude,
  })

  if (!constituency) {
    return NextResponse.json({ error: 'Constituency not found' }, { status: 404 })
  }

  return NextResponse.json(constituency)
}
