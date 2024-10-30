import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

export type AllCompletedRacesResponse = {
  electedCandidates: {
    firstName: string
    lastName: string
    slug: string
    elected: boolean
    state: string
    district: string
    office: string
    partyName: string
  }[]
}

interface RaceWinnerData {
  firstName: string
  lastName: string
  slug: string
  elected: boolean | 'N/A'
  state?: USStateCode
}

export async function getElectedCandidates() {
  const stateKeys = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)
  const stateRaceWinners: RaceWinnerData[] = []

  for (const stateKey of stateKeys) {
    const [stateRacesData, dtsiStateData] = await Promise.all([
      getDecisionDataFromRedis<RacesVotingDataResponse[]>(
        `SWC_${stateKey.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
      ),
      queryDTSILocationStateSpecificInformation({
        stateCode: stateKey as USStateCode,
      }),
    ])

    const currentStateWinners = stateRacesData
      ?.flatMap(currentRace => {
        const currentElectedCandidate = currentRace.candidatesWithVotes.find(
          currentCandidate => currentCandidate.elected,
        )

        // compare with advance_times and advance_candidates to check latest candidate being elected
        // const advanceCandidates = currentRace.advanceCandidates
        // if (advanceCandidates) {
        //   const advancingCandidate = currentRace.advancingCandidates
        // }

        if (!currentElectedCandidate) {
          return null
        }

        const currentCandidateDTSI = dtsiStateData.people.find(currentPerson =>
          getPoliticianFindMatch(currentPerson, currentElectedCandidate),
        )

        return {
          firstName: currentElectedCandidate.firstName,
          lastName: currentElectedCandidate.lastName,
          slug: currentCandidateDTSI?.slug ?? 'N/A',
          elected: currentElectedCandidate.elected,
          state: stateKey as USStateCode,
          district: currentRace.district,
          office: currentRace.office?.officeName,
          partyName: currentElectedCandidate.partyName,
        }
      })
      .filter(Boolean)

    if (!currentStateWinners) {
      console.log(`No data for ${stateKey}`)
      continue
    }

    stateRaceWinners.push(...currentStateWinners)
  }

  return stateRaceWinners
}
