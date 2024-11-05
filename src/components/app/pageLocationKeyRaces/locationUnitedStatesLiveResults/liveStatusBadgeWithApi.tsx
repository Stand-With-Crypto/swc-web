'use client'

import { useMemo } from 'react'
import { isBefore, startOfDay } from 'date-fns'
import useSWR from 'swr'

import {
  LiveStatusBadge,
  Status,
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
      refreshInterval: 60 * 1000,
      errorRetryInterval: 30 * 1000,
      refreshWhenHidden: true,
    },
  )

  return swrData
}

export function LiveStatusBadgeWithApi(props: LiveStatusBadgeWithApiProps) {
  const { initialElectionStatusData } = props

  const { data } = useElectionStatus(initialElectionStatusData)

  const raceStatus = useMemo<Status>(() => {
    if (!data) return 'unknown'

    const now = new Date()
    if (isBefore(startOfDay(now), startOfDay(new Date('2024-11-05')))) {
      return 'not-started'
    }

    if (data.statesFinished.length === data.totalStates) return 'called'

    return 'live'
  }, [data])

  return <LiveStatusBadge status={raceStatus} />
}
