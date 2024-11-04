'use client'

import * as Sentry from '@sentry/nextjs'
import useSWR from 'swr'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

interface UseApiDecisionDeskDataProps {
  initialRaceData: RacesVotingDataResponse[] | undefined | null
  stateCode: string
  district: string | number | undefined
}

export function useApiDecisionDeskData({
  initialRaceData,
  stateCode,
  district,
}: UseApiDecisionDeskDataProps) {
  const hasHydrated = useHasHydrated()

  const swrData = useSWR(
    !hasHydrated
      ? null
      : district
        ? apiUrls.decisionDeskDistrictData({ stateCode, district: district?.toString() })
        : apiUrls.decisionDeskStateData({ stateCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse[]),
    {
      fallbackData: initialRaceData ?? undefined,
      refreshInterval: 30 * 1000, // 30 SECONDS
      refreshWhenHidden: true,
      keepPreviousData: true,
      onError: error => {
        Sentry.captureException(error, {
          extra: {
            stateCode,
            district,
          },
          tags: { domain: 'liveResult' },
        })
      },
    },
  )

  return swrData
}
