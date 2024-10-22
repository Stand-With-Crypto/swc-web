'use client'

import { useCookie } from 'react-use'
import useSWR, { SWRResponse } from 'swr'

import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { SWC_PRESIDENTIAL_RACES_DATA } from '@/mocks/decisionDesk'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID,
  parseKeyRacesMockCookie,
} from '@/utils/shared/keyRacesTampering'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskPresidentialData(
  fallbackData: PresidentialDataWithVotingResponse[] | null,
) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)
  const mockedRaceCookieData = parseKeyRacesMockCookie(apiTamperedValue)

  const swrData = useSWR(
    apiTamperedValue ? null : apiUrls.decisionDeskPresidentialData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as PresidentialDataWithVotingResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 60 * 1000,
      errorRetryInterval: 30 * 1000,
    },
  )

  if (mockedRaceCookieData) {
    const { estimatedVotes, raceStatus } = mockedRaceCookieData

    const mockedData = SWC_PRESIDENTIAL_RACES_DATA.map(currentPresidentialData => {
      const currentVotingData = currentPresidentialData.votingData

      if (currentVotingData) {
        const votes = Math.min(Math.round(+estimatedVotes * Math.random()), +estimatedVotes)
        const electoralVotes = Math.min(Math.round(Math.abs((Math.random() - 0.5) * 538)), 538)
        const called = electoralVotes >= 270 && raceStatus === 'finished'
        const percentage = (electoralVotes / 538) * 100

        return {
          ...currentPresidentialData,
          votingData: {
            ...currentVotingData,
            percentage,
            votes,
            called,
            electoralVotes,
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
