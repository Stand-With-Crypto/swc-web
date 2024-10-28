'use client'

import useSWR from 'swr'

import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskCongressData(
  fallbackData: GetAllCongressDataResponse | undefined,
) {
  const hasHydrated = useHasHydrated()

  const swrData = useSWR(
    !hasHydrated ? null : apiUrls.decisionDeskCongressData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAllCongressDataResponse),
    {
      fallbackData,
      refreshInterval: 30 * 1000,
      refreshWhenHidden: true,
      keepPreviousData: true,
    },
  )

  return swrData
}
