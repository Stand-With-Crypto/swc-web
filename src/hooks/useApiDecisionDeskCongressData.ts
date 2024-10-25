'use client'

import { useCookie } from 'react-use'
import useSWR from 'swr'

import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID } from '@/utils/shared/keyRacesTampering'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskCongressData(
  fallbackData: GetAllCongressDataResponse | undefined,
) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)

  const swrData = useSWR(
    apiTamperedValue ? null : apiUrls.decisionDeskCongressData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAllCongressDataResponse),
    {
      fallbackData,
      refreshInterval: 30 * 1000,
      errorRetryInterval: 30 * 1000,
      refreshWhenHidden: true,
    },
  )

  return swrData
}
