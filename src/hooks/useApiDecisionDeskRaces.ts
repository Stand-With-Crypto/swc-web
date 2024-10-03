'use client'

import useSWR from 'swr'

import { GetRacesParams } from '@/data/decisionDesk/schemas'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { RacesVotingDataResponse } from '@/data/aggregations/getRacesVotingData'

export function useApiDecisionDeskRaces(
  fallbackData: RacesVotingDataResponse,
  params?: GetRacesParams,
) {
  return useSWR(
    apiUrls.decisionDeskRaces(params),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse),
    {
      fallbackData,
      refreshInterval: 120 * 1000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}
