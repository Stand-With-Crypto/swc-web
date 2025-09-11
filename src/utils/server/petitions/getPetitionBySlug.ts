'server-only'

import { getPetitionSignatureCount } from '@/data/petitions/getPetitionSignatureCount'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getPetitionBySlug(countryCode: SupportedCountryCodes, slug: string) {
  // Listing the petitions from builder.io is more performant than filtering by slug because we use the cache
  const petitions = await getAllPetitionsFromBuilderIO({
    countryCode,
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
