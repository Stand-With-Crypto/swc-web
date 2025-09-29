'use client'
import useSWR, { SWRConfiguration } from 'swr'

import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { apiUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PetitionResponse {
  data: SWCPetition
}

export function useApiPetitionBySlug({
  countryCode,
  petitionSlug,
  language = SupportedLanguages.EN,
  config,
}: {
  countryCode: SupportedCountryCodes
  petitionSlug?: string
  language?: SupportedLanguages
  config?: SWRConfiguration<SWCPetition | null>
}) {
  const shouldFetch = petitionSlug
    ? apiUrls.petitionBySlug({ countryCode, language, petitionSlug })
    : null

  return useSWR(
    shouldFetch,
    url =>
      fetchReq(url)
        .then(res => res.json() as Promise<PetitionResponse>)
        .then((data: PetitionResponse) => data.data)
        .catch(() => null),
    config,
  )
}
