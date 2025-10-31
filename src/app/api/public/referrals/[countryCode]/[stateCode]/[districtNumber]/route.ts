import 'server-only'

import { NextRequest, NextResponse } from 'next/server'

import { AdministrativeArea } from '@/utils/server/districtRankings/types'
import { getDistrictRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  zodAUStateDistrict,
  zodCAProvinceDistrict,
  zodGbRegionConstituency,
  zodUSStateDistrict,
} from '@/validation/fields/zodAddress'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const ZOD_SCHEMA_BY_COUNTRY_CODE_MAP = {
  [SupportedCountryCodes.US]: zodUSStateDistrict,
  [SupportedCountryCodes.AU]: zodAUStateDistrict,
  [SupportedCountryCodes.CA]: zodCAProvinceDistrict,
  [SupportedCountryCodes.GB]: zodGbRegionConstituency,
} as const

export async function GET(
  _: NextRequest,
  props: {
    params: Promise<{
      stateCode: string
      districtNumber: string
      countryCode: SupportedCountryCodes
    }>
  },
) {
  const params = await props.params
  const { stateCode, districtNumber, countryCode } = params

  const zodSchema = ZOD_SCHEMA_BY_COUNTRY_CODE_MAP[countryCode]

  if (!zodSchema) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  const parseResult = zodSchema.safeParse({ state: stateCode, district: districtNumber })
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues }, { status: 400 })
  }

  const member = {
    state: parseResult.data.state as AdministrativeArea,
    district: parseResult.data.district,
  }

  const data = await getDistrictRank(countryCode, member)

  return NextResponse.json(data)
}

export type GetDistrictRankResponse = Awaited<ReturnType<typeof getDistrictRank>>
