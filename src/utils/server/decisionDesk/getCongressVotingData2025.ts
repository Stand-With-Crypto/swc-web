import { format, isAfter } from 'date-fns'

import { getDtsiMatchFromDdhq } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { convertDTSIPersonStanceScoreToLetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'
import houseData from '@/mocks/congress/2025/house.json'
import senateData from '@/mocks/congress/2025/senate.json'
import { CandidatesWithVote } from '@/data/aggregations/decisionDesk/types'

interface CongressDataElectionData {
  firstName: string
  lastName: string
  congressType: string
  dtsiMatchFirstName: string
  dtsiMatchLastName: string
  dtsiMatchSlug: string
  dtsiMatchScore: number
  dtsiMatchLetterGrade: string
  dtsiMatchRoleState: string
  dtsiMatchRoleDistrict: string
  dtsiMatchRoleCategory: string
  dtsiMatchRoleDateStart: string
  dtsiMatchRoleDateEnd: string
  dtsiMatchRoleStatus: string
  dtsiMatchPartyCategory: string
  dtsiMatchState: string
  dtsiMatchDistrict: string
}

const params = {
  race_date: '2024-11-05',
  limit: '250',
  year: '2024',
}

export async function getCongressVotingData2025(): Promise<CongressDataElectionData[]> {
  const dtsiAllPeopleData = await queryDTSIAllPeople()

  const allCongressData = houseData.concat(senateData)

  const allCandidates = allCongressData.map(currentCandidate => {
    const dtsiMatch = getDtsiMatchFromDdhq(
      currentCandidate as unknown as CandidatesWithVote,
      dtsiAllPeopleData.people,
    )

    const dtsiMatchLetterGrade = dtsiMatch
      ? convertDTSIPersonStanceScoreToLetterGrade(dtsiMatch)
      : 'N/A'
    const dtsiMatchStartDate = dtsiMatch?.primaryRole?.dateStart
      ? format(new Date(dtsiMatch.primaryRole.dateStart), 'yyyy-MM-dd')
      : 'N/A'
    const dtsiMatchEndDate = dtsiMatch?.primaryRole?.dateEnd
      ? format(new Date(dtsiMatch.primaryRole.dateEnd), 'yyyy-MM-dd')
      : 'N/A'

    return {
      firstName: currentCandidate.firstName ?? 'N/A',
      lastName: currentCandidate.lastName ?? 'N/A',
      congressType: currentCandidate.congressType ?? 'N/A',
      dtsiMatchFirstName: dtsiMatch?.firstName ?? 'N/A',
      dtsiMatchLastName: dtsiMatch?.lastName ?? 'N/A',
      dtsiMatchSlug: dtsiMatch?.slug ?? 'N/A',
      dtsiMatchRoleState: dtsiMatch?.primaryRole?.primaryState ?? 'N/A',
      dtsiMatchRoleDistrict: dtsiMatch?.primaryRole?.primaryDistrict ?? 'N/A',
      dtsiMatchRoleCategory: dtsiMatch?.primaryRole?.roleCategory ?? 'N/A',
      dtsiMatchRoleDateStart: dtsiMatchStartDate,
      dtsiMatchRoleDateEnd: dtsiMatchEndDate,
      dtsiMatchRoleStatus: dtsiMatch?.primaryRole?.status ?? 'N/A',
      dtsiMatchLetterGrade: dtsiMatchLetterGrade ?? 'N/A',
      dtsiMatchScore:
        dtsiMatch?.manuallyOverriddenStanceScore ?? dtsiMatch?.computedStanceScore ?? 0,
      dtsiMatchPartyCategory: dtsiMatch?.politicalAffiliationCategory ?? 'N/A',
      dtsiMatchState: dtsiMatch?.primaryRole?.primaryState ?? 'N/A',
      dtsiMatchDistrict: dtsiMatch?.primaryRole?.primaryDistrict ?? 'N/A',
    }
  })

  return allCandidates
}
