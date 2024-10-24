'use client'

import { useCookie } from 'react-use'
import * as Sentry from '@sentry/nextjs'
import useSWR, { SWRResponse } from 'swr'

import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import * as stateRacesMockData from '@/mocks/decisionDesk'
import { Candidate } from '@/utils/server/decisionDesk/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID,
  parseKeyRacesMockCookie,
} from '@/utils/shared/keyRacesTampering'
import { apiUrls } from '@/utils/shared/urls'

interface UseApiDecisionDeskDataProps {
  initialRaceData: RacesVotingDataResponse[] | undefined
  stateCode: string
  district: string | number | undefined
}

export function useApiDecisionDeskData({
  initialRaceData,
  stateCode,
  district,
}: UseApiDecisionDeskDataProps) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)
  const mockedRaceCookieData = parseKeyRacesMockCookie(apiTamperedValue)

  const swrData = useSWR(
    district
      ? apiUrls.decisionDeskDistrictData({ stateCode, district: district?.toString() })
      : apiUrls.decisionDeskStateData({ stateCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as RacesVotingDataResponse[]),
    {
      fallbackData: initialRaceData ?? undefined,
      refreshInterval: 60 * 1000,
      errorRetryInterval: 30 * 1000,
      refreshWhenHidden: true,
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

  if (mockedRaceCookieData && stateCode) {
    const key = `SWC_${stateCode.toUpperCase()}_STATE_RACES_DATA`
    const { estimatedVotes, raceStatus } = mockedRaceCookieData

    const stateRacesData = stateRacesMockData[
      key as keyof typeof stateRacesMockData
    ] as RacesVotingDataResponse[]

    const mockedData = stateRacesData?.map?.(currentStateRaceData => {
      let mockedCalledCandidate: Candidate | null = null

      const rawVotes = currentStateRaceData.candidatesWithVotes.map(currentCandidate => {
        const votes = Math.min(
          Math.round(+estimatedVotes * Math.abs(Math.random() - 0.5)),
          +estimatedVotes,
        )
        return { ...currentCandidate, votes }
      })

      const highestVoteCandidate = rawVotes.reduce((prev, current) =>
        current.votes > prev.votes ? current : prev,
      )

      const updatedVotes = rawVotes.map(candidate => {
        const elected = candidate.id === highestVoteCandidate.id && raceStatus === 'finished'
        if (elected) {
          mockedCalledCandidate = {
            cand_id: candidate.id,
            first_name: candidate.firstName,
            last_name: candidate.lastName,
          } as Candidate
        }
        return {
          ...candidate,
          elected,
          votes: raceStatus !== 'not-started' ? candidate.votes : 0,
        }
      })

      return {
        ...currentStateRaceData,
        totalVotes: +estimatedVotes,
        calledCandidate: mockedCalledCandidate,
        candidatesWithVotes: updatedVotes,
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
