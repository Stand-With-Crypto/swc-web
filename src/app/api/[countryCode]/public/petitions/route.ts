import { NextResponse } from 'next/server'

import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
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

  const petitions = await getAllPetitionsFromBuilderIO({
    countryCode: validatedCountryCode.data,
  })

  if (!petitions) {
    return NextResponse.json({ error: 'Petitions not found' }, { status: 404 })
  }

  const petitionsWithSignatures = petitions.map((petition, index) => ({
    ...petition,
    signaturesCount: Math.floor((index / 2.5) * petition.countSignaturesGoal),
  }))

  return NextResponse.json({ data: petitionsWithSignatures })
}
