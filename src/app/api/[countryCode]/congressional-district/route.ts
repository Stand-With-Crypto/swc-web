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

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

const GET_CONGRESSIONAL_DISTRICT_TO_COUNTRY_CODE_MAP: Record<
  SupportedCountryCodes,
  GetConstituencyQuery
> = {
  [SupportedCountryCodes.US]: getUSCongressionalDistrict,
  [SupportedCountryCodes.CA]: getCAElectoralDistrict,
  [SupportedCountryCodes.GB]: getUKParliamentaryConstituency,
  [SupportedCountryCodes.AU]: getAUFederalElectoralDistrict,
}

export const GET = async (req: Request, { params }: RequestContext) => {
  const { countryCode } = await params

  const url = new URL(req.url)
  const latitudeParam = url.searchParams.get('latitude')
  const longitudeParam = url.searchParams.get('longitude')

  if (!latitudeParam || !longitudeParam) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const latitude = Number(latitudeParam)
  const longitude = Number(longitudeParam)

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)
  if (!validatedFields.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }
  const validatedCountryCode = validatedFields.data

  const getCongressionalDistrictQuery =
    GET_CONGRESSIONAL_DISTRICT_TO_COUNTRY_CODE_MAP[validatedCountryCode]

  // TODO: add try catch
  const congressionalDistrict = await getCongressionalDistrictQuery({
    latitude,
    longitude,
  })

  return NextResponse.json(congressionalDistrict)
}
