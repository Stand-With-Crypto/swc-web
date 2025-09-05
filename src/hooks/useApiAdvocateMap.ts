'use client'

import useSWR from 'swr'

import { GetAdvocatesMapDataResponse } from '@/data/pageSpecific/getAdvocatesMapData'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiAdvocateMap(fallbackData: GetAdvocatesMapDataResponse) {
  const countryCode = useCountryCode()

  return useSWR(
    apiUrls.totalAdvocatesPerState(countryCode),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAdvocatesMapDataResponse),
    { fallbackData, refreshInterval: 1000 * 30 },
  )
}
