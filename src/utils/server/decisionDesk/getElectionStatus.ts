import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

export type AllCompletedRacesResponse = {
  statesFinished: USStateCode[]
  statesLeft: number
  totalStates: number
}

export async function getElectionStatus() {
  const statesFinished = [] as USStateCode[]
  const stateKeys = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)
  const allCompletedRaces: AllCompletedRacesResponse = {
    statesFinished: [],
    statesLeft: stateKeys.length,
    totalStates: stateKeys.length,
  }

  for (const stateKey of stateKeys) {
    const currentStateKey = stateKey as USStateCode

    try {
      const stateRacesData = await getDecisionDataFromRedis<RacesVotingDataResponse[]>(
        `SWC_${stateKey.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
      )

      if (stateRacesData) {
        const hasCurrentStateFinished = stateRacesData.every(
          currentRace => currentRace.hasCalledCandidate,
        )

        if (hasCurrentStateFinished) {
          statesFinished.push(currentStateKey)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${currentStateKey} state`, (error as Error).message)
    }
  }

  allCompletedRaces.statesFinished = statesFinished
  allCompletedRaces.statesLeft = stateKeys.length - statesFinished.length

  return allCompletedRaces
}
