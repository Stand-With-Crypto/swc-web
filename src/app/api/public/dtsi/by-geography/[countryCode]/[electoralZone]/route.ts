import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSIPeopleByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const zodParams = z.object({
  countryCode: zodSupportedCountryCode,
  electoralZone: z.string(),
  stateCode: z.string().min(2).max(3).optional(),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ stateCode: string; electoralZone: string }> },
) {
  const params = await props.params
  const { electoralZone, countryCode, stateCode } = zodParams.parse(params)
  const data = await queryDTSIPeopleByElectoralZone({
    electoralZone,
    countryCode,
    stateCode,
  })
  return NextResponse.json(data)
}
