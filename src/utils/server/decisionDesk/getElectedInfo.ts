import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleGroupCategory,
} from '@/data/dtsi/generated'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { convertDTSIPersonStanceScoreToLetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

interface DtsiCandOrIncumbent {
  firstName: string
  lastName: string
  slug: string
  computedScore: number | null | undefined
  computedSumStanceScoreWeight: number | null | undefined
  manuallyOverriddenStanceScore: number | null | undefined
  letterGrade: string | null
  partyName: DTSI_PersonPoliticalAffiliationCategory | null | undefined
  state: USStateCode
  ddhqPerson: {
    votes: number
    elected: boolean
  } | null
}

export async function getElectedInfo() {
  const stateKeys = Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)

  const allCandidates: DtsiCandOrIncumbent[] = []
  const dtsiCandidates: DtsiCandOrIncumbent[] = []
  const dtsiIncumbents: DtsiCandOrIncumbent[] = []

  for (const stateKey of stateKeys) {
    const [stateRacesData, dtsiStateData] = await Promise.all([
      getDecisionDataFromRedis<RacesVotingDataResponse[]>(
        `SWC_${stateKey.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
      ),
      queryDTSILocationStateSpecificInformation({
        stateCode: stateKey as USStateCode,
      }),
    ])

    for (const currentDtsiPerson of dtsiStateData.people) {
      const ddhqPerson = stateRacesData
        ?.flatMap(currentRace => {
          const currentDDHQPerson = currentRace.candidatesWithVotes.find(currentCandidate =>
            getPoliticianFindMatch(currentDtsiPerson as DTSI_Candidate, currentCandidate),
          )

          return currentDDHQPerson
        })
        .filter(Boolean)
        .at(0)
      const incumbentIndex = currentDtsiPerson.roles.findIndex(currentRole => {
        return (
          currentRole?.group?.groupInstance === '118' &&
          currentRole.group.category === DTSI_PersonRoleGroupCategory.CONGRESS
        )
      })

      const isIncumbent = incumbentIndex === 0 || incumbentIndex === 1

      const personData = {
        firstName: currentDtsiPerson.firstName,
        lastName: currentDtsiPerson.lastName,
        slug: currentDtsiPerson.slug,
        computedScore: currentDtsiPerson.computedStanceScore,
        computedSumStanceScoreWeight: currentDtsiPerson.computedSumStanceScoreWeight,
        manuallyOverriddenStanceScore: currentDtsiPerson.manuallyOverriddenStanceScore,
        letterGrade: convertDTSIPersonStanceScoreToLetterGrade(currentDtsiPerson),
        partyName: currentDtsiPerson.politicalAffiliationCategory,
        state: stateKey as USStateCode,
        ddhqPerson: ddhqPerson
          ? {
              votes: ddhqPerson.votes,
              elected: ddhqPerson.elected,
            }
          : null,
      }

      allCandidates.push(personData)

      if (isIncumbent) {
        dtsiIncumbents.push(personData)

        continue
      }

      dtsiCandidates.push(personData)
    }
  }

  const electedABIncumbents = dtsiIncumbents.filter(currentIncumbent => {
    return (
      currentIncumbent.ddhqPerson?.elected &&
      (currentIncumbent.letterGrade === 'A' || currentIncumbent.letterGrade === 'B')
    )
  })

  const percentElectedABIncumbents =
    electedABIncumbents.length > 0 ? (electedABIncumbents.length / dtsiIncumbents.length) * 100 : 0

  const percentElectedABIncumbentsToAll =
    electedABIncumbents.length > 0 ? (electedABIncumbents.length / allCandidates.length) * 100 : 0

  const notElectedDFCandidates = dtsiCandidates.filter(currentCandidate => {
    return (
      !currentCandidate.ddhqPerson?.elected &&
      (currentCandidate.letterGrade === 'D' || currentCandidate.letterGrade === 'F')
    )
  })

  const percentNotElectedDFCandidates =
    notElectedDFCandidates.length > 0
      ? (notElectedDFCandidates.length / dtsiCandidates.length) * 100
      : 0

  const percentNotElectedDFCandidatesToAll =
    notElectedDFCandidates.length > 0
      ? (notElectedDFCandidates.length / allCandidates.length) * 100
      : 0

  const totalVotesCastABCandidates = allCandidates.reduce((acc, currentCandidate) => {
    if (currentCandidate.letterGrade === 'A' || currentCandidate.letterGrade === 'B') {
      return currentCandidate.ddhqPerson ? acc + currentCandidate.ddhqPerson.votes : acc
    }

    return acc
  }, 0)

  return {
    totalElectedABIncumbents: electedABIncumbents.length,
    percentElectedABIncumbents: `${percentElectedABIncumbents.toFixed(4)}%`,
    percentElectedABIncumbentsToAll: `${percentElectedABIncumbentsToAll.toFixed(4)}%`,
    totalNotElectedDFCandidates: notElectedDFCandidates.length,
    percentNotElectedDFCandidates: `${percentNotElectedDFCandidates.toFixed(4)}%`,
    percentNotElectedDFCandidatesToAll: `${percentNotElectedDFCandidatesToAll.toFixed(4)}%`,
    totalVotesCastABCandidates,
  }
}
