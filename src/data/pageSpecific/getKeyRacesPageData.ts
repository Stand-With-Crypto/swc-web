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

  const [ddhqRedisPresidentialResult, ddhqRedisCongressResult, ddhqRedisElectionStatus] =
    await Promise.allSettled([
      getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>('SWC_PRESIDENTIAL_RACES_DATA'),
      getCongressLiveResultData(),
      getElectionStatus(),
      racesPromises,
    ])

  if (ddhqRedisPresidentialResult.status === 'fulfilled') {
    presidentialRaceLiveResult = ddhqRedisPresidentialResult.value
  } else {
    Sentry.captureException(ddhqRedisPresidentialResult.reason, {
      extra: { key: 'SWC_PRESIDENTIAL_RACES_DATA', reason: ddhqRedisPresidentialResult.reason },
      tags: { domain: 'liveResult' },
    })
    throw ddhqRedisPresidentialResult.reason
  }

  if (ddhqRedisCongressResult.status === 'fulfilled') {
    congressRaceLiveResult = ddhqRedisCongressResult.value
  } else {
    Sentry.captureException(ddhqRedisCongressResult.reason, {
      extra: {
        keys: ['SWC_ALL_SENATE_DATA', 'SWC_ALL_HOUSE_DATA'],
        reason: ddhqRedisCongressResult.reason,
      },
      tags: { domain: 'liveResult' },
    })
    throw ddhqRedisCongressResult.reason
  }

  if (ddhqRedisElectionStatus.status === 'fulfilled') {
    initialElectionStatusData = ddhqRedisElectionStatus.value
  } else {
    Sentry.captureException(ddhqRedisElectionStatus.reason, {
      extra: { reason: ddhqRedisElectionStatus.reason },
      tags: { domain: 'liveResult' },
    })
    throw ddhqRedisElectionStatus.reason
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
