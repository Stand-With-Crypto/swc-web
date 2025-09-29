'server-only'

import { getPetitionsSignaturesCount } from '@/data/petitions/getPetitionsSignaturesCount'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

/**
 * Server function for fetching all petitions with signature counts
 *
 * IMPORTANT: Use this function for static page generation (getStaticProps, generateStaticParams, etc.)
 * This function directly queries the data sources without relying on API routes,
 * preventing build-time dependencies that could cause deployment failures.
 *
 * Do NOT use the API route equivalent during build time.
 */
export async function getAllPetitions({
  countryCode,
  language,
}: {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}): Promise<SWCPetition[] | null> {
  const petitions = await getAllPetitionsFromBuilderIO({
    countryCode,
    language,
  })

  if (!petitions) {
    return null
  }

  const petitionsSignaturesCountBySlug = await getPetitionsSignaturesCount({
    countryCode,
    petitionsSlugs: petitions.map(petition => petition.slug),
  })

  const petitionsWithSignatures = petitions.map(petition => ({
    ...petition,
    signaturesCount: petitionsSignaturesCountBySlug[petition.slug] || 0,
  }))

  return petitionsWithSignatures
}
