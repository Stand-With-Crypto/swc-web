'use client'

import useSWR from 'swr'

import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskCongressData(fallbackData: GetAllCongressDataResponse | null) {
  return useSWR(
    apiUrls.decisionDeskCongressData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAllCongressDataResponse),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 120 * 1000,
    },
  )
}
