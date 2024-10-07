'use client'

import useSWR from 'swr'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskStateData(
  fallbackData: RacesVotingDataResponse[] | null,
  state: string,
  district?: number,
) {
  return useSWR(
    apiUrls.decisionDeskStateData(state, district),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 120 * 1000,
    },
  )
}
