import * as Sentry from '@sentry/nextjs'

import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import {
  CongressDataResponse,
  GetAllCongressDataResponse,
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import {
  DecisionDeskRedisKeys,
  getDecisionDataFromRedis,
} from '@/utils/server/decisionDesk/cachedData'
import { getElectionStatus } from '@/utils/server/decisionDesk/getElectionStatus'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const getKeyRacesPageData = async () => {
  const dtsiResults = await queryDTSILocationUnitedStatesInformation()
  const races = organizePeople(dtsiResults)

  const racesDataMap: Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null> =
    {} as Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null>

  const racesPromises = Object.entries(races.keyRaces).flatMap(([stateCode]) => {
    const key: DecisionDeskRedisKeys = `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`

    return getDecisionDataFromRedis<RacesVotingDataResponse[]>(key)
      .then(data => {
        racesDataMap[key] = data
      })
      .catch(error => {
        Sentry.captureException(error, {
          extra: { key },
          tags: { domain: 'liveResult' },
        })
        racesDataMap[key] = null
      })
  })

  let presidentialRaceLiveResult: PresidentialDataWithVotingResponse[] | null = null
  let congressRaceLiveResult: GetAllCongressDataResponse = {
    senateDataWithDtsi: null,
    houseDataWithDtsi: null,
  }
  let initialElectionStatusData = null

  const [presidentialResult, congressResult, electionStatusResult] = await Promise.allSettled([
    getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>('SWC_PRESIDENTIAL_RACES_DATA'),
    getCongressLiveResultData(),
    getElectionStatus(),
    racesPromises,
  ])

  if (presidentialResult.status === 'fulfilled') {
    presidentialRaceLiveResult = presidentialResult.value
  } else {
    Sentry.captureException(presidentialResult.reason, {
      extra: { key: 'SWC_PRESIDENTIAL_RACES_DATA' },
      tags: { domain: 'liveResult' },
    })
    throw presidentialResult.reason
  }

  if (congressResult.status === 'fulfilled') {
    congressRaceLiveResult = congressResult.value
  } else {
    Sentry.captureException(congressResult.reason, {
      extra: { keys: ['SWC_ALL_SENATE_DATA', 'SWC_ALL_HOUSE_DATA'] },
      tags: { domain: 'liveResult' },
    })
    throw congressResult.reason
  }

  if (electionStatusResult.status === 'fulfilled') {
    initialElectionStatusData = electionStatusResult.value
  } else {
    Sentry.captureException(electionStatusResult.reason, {
      tags: { domain: 'liveResult' },
    })
    throw electionStatusResult.reason
  }

  return {
    dtsiResults: races,
    ddhqResults: racesDataMap,
    presidentialRaceLiveResult,
    congressRaceLiveResult,
    initialElectionStatusData,
  }
}

export async function getCongressLiveResultData(): Promise<GetAllCongressDataResponse> {
  let congressRaceLiveResult: GetAllCongressDataResponse = {
    senateDataWithDtsi: null,
    houseDataWithDtsi: null,
  }
  try {
    const [senateRaceLiveResult, houseRaceLiveResult] = await Promise.allSettled([
      getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_SENATE_DATA'),
      getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_HOUSE_DATA'),
    ])

    congressRaceLiveResult = {
      senateDataWithDtsi:
        senateRaceLiveResult.status === 'fulfilled' ? senateRaceLiveResult.value : null,
      houseDataWithDtsi:
        houseRaceLiveResult.status === 'fulfilled' ? houseRaceLiveResult.value : null,
    }

    if (!congressRaceLiveResult.senateDataWithDtsi || !congressRaceLiveResult.houseDataWithDtsi) {
      throw new Error('Failed to get live congress data')
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { keys: ['SWC_ALL_SENATE_DATA', 'SWC_ALL_HOUSE_DATA'] },
      tags: { domain: 'liveResult' },
    })
    throw error
  }

  return congressRaceLiveResult
}
