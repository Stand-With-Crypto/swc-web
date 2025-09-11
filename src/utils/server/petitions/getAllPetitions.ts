'server-only'

import { getPetitionsSignaturesCount } from '@/data/petitions/getPetitionsSignaturesCount'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export async function getAllPetitions(
  countryCode: SupportedCountryCodes,
): Promise<SWCPetition[] | null> {
  const petitions = await getAllPetitionsFromBuilderIO({
    countryCode,
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
