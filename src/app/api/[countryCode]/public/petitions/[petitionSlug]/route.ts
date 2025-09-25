import { NextResponse } from 'next/server'

import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { getAllPetitions } from '@/utils/server/petitions/getAllPetitions'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const revalidate = 60 // 60 seconds
export const dynamic = 'error'

export async function generateStaticParams() {
  const allParams: Array<{ countryCode: string; petitionSlug: string }> = []

  for (const countryCode of ORDERED_SUPPORTED_COUNTRIES) {
    try {
      const petitions = await getAllPetitionsFromBuilderIO({ countryCode })
      if (petitions) {
        for (const petition of petitions) {
          allParams.push({
            countryCode,
            petitionSlug: petition.slug,
          })
        }
      }
    } catch (error) {
      console.error(`Error generating static params for ${countryCode}:`, error)
    }
  }

  return allParams
}

interface RequestContext {
  params: Promise<{
    countryCode: SupportedCountryCodes
    petitionSlug: string
  }>
}

/**
 * API Route for fetching a single petition by slug
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
 * For static page generation, use getPetitionBySlug() function directly instead.
 */
export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode, petitionSlug } = await params

  const validatedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  if (!validatedCountryCode.success) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  try {
    const petitions = await getAllPetitions({ countryCode: validatedCountryCode.data })

    if (!petitions) {
      return NextResponse.json({ error: 'Error fetching petitions' }, { status: 404 })
    }

    const petition = petitions.find(p => p.slug === petitionSlug)

    if (!petition) {
      return NextResponse.json({ error: 'Petition not found' }, { status: 404 })
    }

    return NextResponse.json({ data: petition })
  } catch (error) {
    console.error('Error fetching petition by slug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
