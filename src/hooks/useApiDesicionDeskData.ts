'use client'

import useSWR from 'swr'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskData(
  fallbackData: RacesVotingDataResponse[] | undefined,
  params: {
    stateCode: string
    district?: string
  },
) {
  const { stateCode, district } = params

  return useSWR(
    district
      ? apiUrls.decisionDeskDistrictData({ stateCode, district })
      : apiUrls.decisionDeskStateData({ stateCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 60 * 1000,
    },
  )
}
