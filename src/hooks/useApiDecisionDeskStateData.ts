'use client'

import { useCookie } from 'react-use'
import useSWR, { SWRResponse } from 'swr'

import { INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID } from '@/app/[locale]/internal/api-tampering/key-races/page'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import * as stateRacesMockData from '@/mocks/decisionDesk'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskStateData(
  fallbackData: RacesVotingDataResponse[] | null,
  state: string,
) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)

  const swrData = useSWR(
    apiTamperedValue ? null : apiUrls.decisionDeskStateData({ stateCode: state }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse[]),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 120 * 1000,
    },
  )

  if (apiTamperedValue && state) {
    const key = `SWC_${state.toUpperCase()}_STATE_RACES_DATA`

    const stateRacesData = stateRacesMockData[
      key as keyof typeof stateRacesMockData
    ] as RacesVotingDataResponse[]

    const mockedData = stateRacesData.map(currentStateRaceData => {
      return {
        ...currentStateRaceData,
        candidatesWithVotes: currentStateRaceData.candidatesWithVotes.map(currentCandidate => {
          return {
            ...currentCandidate,
            votes: Math.round((currentCandidate.votes ?? 1000) * (+apiTamperedValue / 100)),
            estimatedVotes: {
              ...currentCandidate.estimatedVotes,
              estimatedVotesMid: +apiTamperedValue,
            },
          }
        }),
      }
    })

    return {
      data: mockedData,
      error: undefined,
      isLoading: false,
      isValidating: false,
    } as SWRResponse<RacesVotingDataResponse[]>
  }

  return swrData
}
