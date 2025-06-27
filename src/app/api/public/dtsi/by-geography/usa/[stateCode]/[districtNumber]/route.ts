import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { queryDTSIPeopleByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

const zodParams = z.object({
  districtNumber: z.string(),
  stateCode: zodUsaState.optional(),
})

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ stateCode: string; districtNumber: string }> },
) {
  const params = await props.params
  const { stateCode, districtNumber } = zodParams.parse(params)
  const data = await queryDTSIPeopleByElectoralZone({
    stateCode,
    electoralZone: String(districtNumber),
    countryCode: SupportedCountryCodes.US,
  })
  return NextResponse.json(data)
}
