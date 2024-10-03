'use client'

import { useCookie } from 'react-use'
import useSWR from 'swr'

import { INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID } from '@/app/[locale]/internal/api-tampering/key-races/page'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { SWC_PRESIDENTIAL_RACES_DATA } from '@/mocks/decisionDesk'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskPresidentialData(
  fallbackData: PresidentialDataWithVotingResponse[] | null,
) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)

  const swrData = useSWR(
    apiTamperedValue ? null : apiUrls.decisionDeskPresidentialData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PresidentialDataWithVotingResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 120 * 1000,
    },
  )

  if (apiTamperedValue) {
    return (SWC_PRESIDENTIAL_RACES_DATA as PresidentialDataWithVotingResponse[]).map(
      currentPresidentialData => {
        const currentVotingData = currentPresidentialData.votingData

        if (currentVotingData) {
          return {
            ...currentPresidentialData,
            votingData: {
              ...currentVotingData,
              percentage: (currentVotingData.percentage ?? 100) * (+apiTamperedValue / 100),
              electoralVotes: Math.round(
                (currentVotingData.electoralVotes ?? 1000) * (+apiTamperedValue / 100),
              ),
              votes: Math.round((currentVotingData.votes ?? 1000) * (+apiTamperedValue / 100)),
            },
          }
        }

        return currentPresidentialData
      },
    ) as PresidentialDataWithVotingResponse[]
  }

  return swrData
}

export function useDecisionDeskPresidentRace(fallbackData: PresidentialDataWithVotingResponse) {
  return useSWR(
    apiUrls.decisionDeskRaces(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PresidentialDataWithVotingResponse),
    {
      fallbackData,
      refreshInterval: 120 * 1000,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}
