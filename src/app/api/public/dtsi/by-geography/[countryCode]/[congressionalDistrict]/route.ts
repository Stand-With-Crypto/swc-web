import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSIPeopleByCongressionalDistrict } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const zodParams = z.object({
  countryCode: zodSupportedCountryCode,
  congressionalDistrict: z.string(),
  stateCode: z.string().min(2).max(3).optional(),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ stateCode: string; districtNumber: string }> },
) {
  const params = await props.params
  const { congressionalDistrict, countryCode, stateCode } = zodParams.parse(params)
  const data = await queryDTSIPeopleByCongressionalDistrict({
    congressionalDistrict: congressionalDistrict,
    countryCode,
    stateCode,
  })
  return NextResponse.json(data)
}
