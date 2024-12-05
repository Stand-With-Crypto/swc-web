import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDtsiMatchFromDdhq } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import {
  DecisionDeskRedisKeys,
  getDecisionDataFromRedis,
} from '@/utils/server/decisionDesk/cachedData'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

export async function getCandidatesMismatches() {
  const stateKeys = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)
  const mismatchCandidates = []

  for (const stateKey of stateKeys) {
    const key: DecisionDeskRedisKeys = `SWC_${stateKey?.toUpperCase() as USStateCode}_STATE_RACES_DATA`
    const [stateRaceData, dtsiStateData] = await Promise.all([
      getDecisionDataFromRedis<RacesVotingDataResponse[]>(key),
      queryDTSILocationStateSpecificInformation({
        stateCode: stateKey as USStateCode,
      }),
    ])

    const currentStateMismatches = stateRaceData
      ?.flatMap(currentRace => {
        const currentCandidates = currentRace.candidatesWithVotes

        const currentMismatchCandidates = currentCandidates
          .map(currentCandidate => {
            const candidateDtsiData = getDtsiMatchFromDdhq(currentCandidate, dtsiStateData.people)

            if (!candidateDtsiData) {
              return {
                firstName: currentCandidate.firstName,
                lastName: currentCandidate.lastName,
                state: stateKey as USStateCode,
                district: currentRace.district,
                office: currentRace.office?.officeName,
                partyName: currentCandidate.partyName,
              }
            }

            return null
          })
          .filter(Boolean)

        const currentMinusMismatchLength =
          currentCandidates.length - currentMismatchCandidates.length

        if (
          currentMinusMismatchLength < currentMismatchCandidates.length ||
          (currentCandidates.length > 2 && currentMinusMismatchLength < 2)
        ) {
          return currentMismatchCandidates
        }

        return null
      })
      .filter(Boolean)

    if (currentStateMismatches) {
      mismatchCandidates.push(...currentStateMismatches)
    }
  }

  return mismatchCandidates
}
