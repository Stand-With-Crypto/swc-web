import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

export type AllCompletedRacesResponse = {
  statesFinished: USStateCode[]
  runoffStates: {
    state: USStateCode
    races: RacesVotingDataResponse[]
  }[]
  statesLeft: number
  totalStates: number
}

export async function getElectionStatus() {
  const stateKeys = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)
  const allCompletedRaces: AllCompletedRacesResponse = {
    statesFinished: [],
    runoffStates: [],
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

        const runoffRaces = stateRacesData.filter(currentRace => currentRace.advanceCandidates)

        if (runoffRaces.length > 0) {
          allCompletedRaces.runoffStates.push({
            state: currentStateKey,
            races: runoffRaces,
          })
        }

        if (hasCurrentStateFinished) {
          allCompletedRaces.statesFinished.push(currentStateKey)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${currentStateKey} state`, (error as Error).message)
    }
  }

  return {
    ...allCompletedRaces,
    statesLeft: stateKeys.length - allCompletedRaces.statesFinished.length,
  }
}
