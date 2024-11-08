'use client'

import { useMemo } from 'react'
import { isBefore, startOfDay } from 'date-fns'

import {
  LiveStatusBadge,
  RaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { AllCompletedRacesResponse } from '@/utils/server/decisionDesk/getElectionStatus'

interface LiveStatusBadgeWithApiProps {
  initialElectionStatusData: AllCompletedRacesResponse | undefined
}

export function LiveStatusBadgeWithApi(props: LiveStatusBadgeWithApiProps) {
  const { initialElectionStatusData } = props

  const data = initialElectionStatusData

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
