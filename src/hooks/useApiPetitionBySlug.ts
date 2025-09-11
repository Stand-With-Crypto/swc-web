'use client'
import useSWR, { SWRConfiguration } from 'swr'

import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PetitionResponse {
  data: SWCPetition
}

export function useApiPetitionBySlug(
  countryCode: SupportedCountryCodes,
  petitionSlug?: string,
  config?: SWRConfiguration<SWCPetition | null>,
) {
  const shouldFetch = petitionSlug ? apiUrls.petitionBySlug({ countryCode, petitionSlug }) : null

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
