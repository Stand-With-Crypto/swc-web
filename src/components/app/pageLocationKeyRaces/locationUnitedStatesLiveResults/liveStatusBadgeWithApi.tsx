'use client'

import { useMemo } from 'react'

import {
  LiveStatusBadge,
  Status,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { getRaceStatus } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { useApiDecisionDeskData } from '@/hooks/useApiDecisionDeskStateData'

interface LiveStatusBadgeWithApiProps {
  initialRaceData: RacesVotingDataResponse[] | null
}

// const useAllRacesLiveResultData = (initialRaceData: RacesVotingDataResponse[] | null) => {
//   const swrData = useSWR(
//     apiUrls.decisionDeskAllRacesData(),
//     url =>
//       fetchReq(url)
//         .then(res => res.json())
//         .then(data => data as RacesVotingDataResponse[]),
//     {
//       fallbackData: initialRaceData || undefined,
//       refreshInterval: 60 * 1000,
//       errorRetryInterval: 30 * 1000,
//       refreshWhenHidden: true,
//       onError: error => {
//         Sentry.captureException(error, {
//           tags: { domain: 'liveResult' },
//         })
//       },
//     },
//   )

//   return swrData
// }

export function LiveStatusBadgeWithApi(props: LiveStatusBadgeWithApiProps) {
  const { initialRaceData } = props

  // const { data } = useAllRacesLiveResultData(initialRaceData)
  const { data } = useApiDecisionDeskData({
    initialRaceData,
    stateCode: 'HI',
    district: undefined,
  })

  const raceStatus = useMemo<Status>(() => getRaceStatus(data), [data])

  return <LiveStatusBadge status={raceStatus} />
}
