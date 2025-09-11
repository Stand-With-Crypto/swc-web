import { NextResponse } from 'next/server'

import { getAllPetitions } from '@/utils/server/petitions/getAllPetitions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 60 // 60 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
  }>
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params

  const validatedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedCountryCode.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  const petitions = await getAllPetitions(validatedCountryCode.data)

  return NextResponse.json({ data: petitions })
}
