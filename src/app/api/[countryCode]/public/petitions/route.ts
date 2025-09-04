import { NextResponse } from 'next/server'

import { getPetitionsSignaturesCount } from '@/data/petitions/getPetitionsSignaturesCount'
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

  const petitionsSignaturesCountBySlug = await getPetitionsSignaturesCount({
    countryCode,
    petitionsSlugs: petitions.map(petition => petition.slug),
  })

  const petitionsWithSignatures = petitions.map(petition => ({
    ...petition,
    signaturesCount: petitionsSignaturesCountBySlug[petition.slug] || 0,
  }))

  return NextResponse.json({ data: petitionsWithSignatures })
}
