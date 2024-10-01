'use client'

import useSWR from 'swr'

import { GetRacesParams } from '@/data/decisionDesk/schemas'
import { GetRacesResponse } from '@/data/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskRaces(fallbackData: GetRacesResponse, params?: GetRacesParams) {
  return useSWR(
    apiUrls.decisionDeskRaces(params),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetRacesResponse),
    { fallbackData, refreshInterval: 60 * 1000 },
  )
}
