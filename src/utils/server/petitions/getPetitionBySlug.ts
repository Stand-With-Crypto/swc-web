'server-only'

import { getPetitionSignatureCount } from '@/data/petitions/getPetitionSignatureCount'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

/**
 * Server function for fetching a single petition by slug with signature count
 *
 * IMPORTANT: Use this function for static page generation (getStaticProps, generateStaticParams, etc.)
 * This function directly queries the data sources without relying on API routes,
 * preventing build-time dependencies that could cause deployment failures.
 *
 * Do NOT use the API route equivalent during build time.
 *
 * Note: Uses getAllPetitionsFromBuilderIO() with cache for better performance
 * rather than filtering by slug directly.
 */
export async function getPetitionBySlug({
  countryCode,
  slug,
  language = SupportedLanguages.EN,
}: {
  countryCode: SupportedCountryCodes
  slug: string
  language?: SupportedLanguages
}) {
  // Listing the petitions from builder.io is more performant than filtering by slug because we use the cache
  const petitions = await getAllPetitionsFromBuilderIO({
    countryCode,
    language,
  })

  const petition = petitions?.find(p => p.slug === slug)

  if (!petition) {
    return null
  }

  const petitionSignatureCount = await getPetitionSignatureCount({
    countryCode,
    petitionSlug: slug,
  })

  return {
    ...petition,
    signaturesCount: petitionSignatureCount,
  }
}
