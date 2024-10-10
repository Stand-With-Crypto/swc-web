'use client'

import { useCookie } from 'react-use'
import useSWR, { SWRResponse } from 'swr'

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
    const mockedData = SWC_PRESIDENTIAL_RACES_DATA.map(currentPresidentialData => {
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
    })

    return {
      data: mockedData,
      error: undefined,
      isLoading: false,
      isValidating: false,
    } as SWRResponse<PresidentialDataWithVotingResponse[]>
  }

  return swrData
}
