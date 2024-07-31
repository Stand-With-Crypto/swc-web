'use client'

import useSWR from 'swr'

import { GetAdvocatesMapDataResponse } from '@/data/pageSpecific/getAdvocatesMapData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiAdvocateMap(fallbackData: GetAdvocatesMapDataResponse) {
  return useSWR(
    apiUrls.totalAdvocatesPerState(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAdvocatesMapDataResponse),
    { fallbackData, refreshInterval: 1000 * 30 },
  )
}
