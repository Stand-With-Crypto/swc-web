import { NextResponse } from 'next/server'

import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls, INTERNAL_BASE_URL } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 60 // 60 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
    petitionSlug: string
  }>
}

interface PetitionsListResponse {
  data: SWCPetition[]
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode, petitionSlug } = await params

  const validatedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedCountryCode.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  try {
    const response = await fetchReq(`${INTERNAL_BASE_URL}${apiUrls.petitions({ countryCode })}`)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch petitions' }, { status: response.status })
    }

    const petitionsData = (await response.json()) as PetitionsListResponse

    // it is better to do a find here, because the route we are consuming is static,
    // so we don't need to query builder.io for the petition and do the counts on database again
    const petition = petitionsData.data.find(p => p.slug === petitionSlug)

    if (!petition) {
      return NextResponse.json({ error: 'Petition not found' }, { status: 404 })
    }

    return NextResponse.json({ data: petition })
  } catch (error) {
    console.error('Error fetching petition by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
