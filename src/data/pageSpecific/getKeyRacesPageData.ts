import * as Sentry from '@sentry/nextjs'

import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import {
  GetAllCongressDataResponse,
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import {
  DecisionDeskRedisKeys,
  getDecisionDataFromRedis,
} from '@/utils/server/decisionDesk/cachedData'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const getKeyRacesPageData = async () => {
  const [dtsiResults] = await Promise.all([queryDTSILocationUnitedStatesInformation()])

  const races = organizePeople(dtsiResults)

  const racesDataMap: Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null> =
    {} as Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null>

  const racesPromises = Object.entries(races.keyRaces).flatMap(async ([stateCode]) => {
    const key: DecisionDeskRedisKeys = `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`

    const data = await getDecisionDataFromRedis<RacesVotingDataResponse[]>(key)
    racesDataMap[key] = data
  })

  await Promise.all(racesPromises)

  let presidentialRaceLiveResult: PresidentialDataWithVotingResponse[] | null = null
  try {
    presidentialRaceLiveResult = await getDecisionDataFromRedis<
      PresidentialDataWithVotingResponse[]
    >('SWC_PRESIDENTIAL_RACES_DATA')
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'SWC_PRESIDENTIAL_RACES_DATA' },
    })
    throw error
  }

  let congressRaceLiveResult: GetAllCongressDataResponse | null = null
  try {
    congressRaceLiveResult =
      await getDecisionDataFromRedis<GetAllCongressDataResponse>('SWC_ALL_CONGRESS_DATA')
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'SWC_ALL_CONGRESS_DATA' },
    })
    throw error
  }

  return {
    dtsiResults: races,
    ddhqResults: racesDataMap,
    presidentialRaceLiveResult,
    congressRaceLiveResult,
  }
}