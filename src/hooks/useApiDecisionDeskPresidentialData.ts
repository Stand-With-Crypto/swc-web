'use client'

import * as Sentry from '@sentry/nextjs'
import useSWR from 'swr'

import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskPresidentialData(
  fallbackData: PresidentialDataWithVotingResponse[] | null,
) {
  const hasHydrated = useHasHydrated()

  const swrData = useSWR(
    !hasHydrated ? null : apiUrls.decisionDeskPresidentialData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PresidentialDataWithVotingResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 30 * 1000,
      refreshWhenHidden: true,
      keepPreviousData: true,
      onError: error => {
        Sentry.captureException(error, {
          tags: { domain: 'liveResult' },
        })
      },
    },
  )

  return swrData
}
