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

/**
 * API Route for fetching all petitions
 *
 * WARNING: Do NOT use this route during static page generation (getStaticProps, generateStaticParams, etc.)
 * Using API routes during build time creates a dependency on the previous deployment's data,
 * which can cause build failures if the API payload structure changes between deployments.
 *
 * Use cases:
 * - Client-side data fetching
 * - When route caching is beneficial
 * - Runtime data fetching
 *
 * For static page generation, use getAllPetitions() function directly instead.
 */
export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params

  const validatedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedCountryCode.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  const petitions = await getAllPetitions({ countryCode: validatedCountryCode.data })

  return NextResponse.json({ data: petitions })
}
