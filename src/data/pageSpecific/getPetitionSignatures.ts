import 'server-only'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getPetitionSignatures() {
  const GBProInnovationPetitionSignatures = 24626

  const result: Record<SupportedCountryCodes, number> & { total: number } = {
    [SupportedCountryCodes.US]: 0,
    [SupportedCountryCodes.GB]: GBProInnovationPetitionSignatures,
    [SupportedCountryCodes.CA]: 0,
    [SupportedCountryCodes.AU]: 0,
    [SupportedCountryCodes.EU]: 0,
    total: GBProInnovationPetitionSignatures,
  }

  return result
}

export type GetPetitionSignaturesResponse = Awaited<ReturnType<typeof getPetitionSignatures>>
