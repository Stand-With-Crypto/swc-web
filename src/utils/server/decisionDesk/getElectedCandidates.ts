import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getMatchingDTSIDataForDDHQCandidate } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

interface RaceWinnerData {
  firstName: string
  lastName: string
  slug: string
  elected: boolean | string
  state?: USStateCode
  district?: string
  office?: string
  partyName?: string
}

export async function getElectedCandidates(): Promise<RaceWinnerData[]> {
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

        if (!currentElectedCandidate) {
          return null
        }

        const currentCandidateDTSI = getMatchingDTSIDataForDDHQCandidate(
          currentElectedCandidate,
          dtsiStateData.people,
        )

        return {
          firstName: currentElectedCandidate.firstName,
          lastName: currentElectedCandidate.lastName,
          slug: currentCandidateDTSI?.slug ?? 'N/A',
          elected: currentRace.advanceCandidates ? 'RUN OFF' : currentElectedCandidate.elected,
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
