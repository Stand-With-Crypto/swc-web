'use client'

import { useMemo } from 'react'
import { isBefore, startOfDay } from 'date-fns'
import useSWR from 'swr'

import {
  LiveStatusBadge,
  RaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { AllCompletedRacesResponse } from '@/utils/server/decisionDesk/getElectionStatus'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

interface LiveStatusBadgeWithApiProps {
  initialElectionStatusData: AllCompletedRacesResponse | undefined
}

const useElectionStatus = (initialData: AllCompletedRacesResponse | undefined) => {
  const swrData = useSWR(
    apiUrls.decisionDeskElectionStatusData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as AllCompletedRacesResponse),
    {
      fallbackData: initialData,
      refreshInterval: 60 * 1000, // 1 MINUTE
      errorRetryInterval: 30 * 1000, // 30 SECONDS
      refreshWhenHidden: true,
    },
  )

  return swrData
}

export function LiveStatusBadgeWithApi(props: LiveStatusBadgeWithApiProps) {
  const { initialElectionStatusData } = props

  const { data } = useElectionStatus(initialElectionStatusData)

  const raceStatus = useMemo<RaceStatus>(() => {
    if (!data) return 'unknown'

    if (data.statesFinished.length === data.totalStates) return 'called'

    const now = new Date()
    if (isBefore(now, startOfDay(new Date('2024-11-05')))) {
      return 'live'
    }

    return 'live'
  }, [data])

  return <LiveStatusBadge status={raceStatus} />
}
