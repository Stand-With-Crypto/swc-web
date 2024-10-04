import { isNil } from 'lodash-es'

import { DTSI_DDHQ_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { dtsiPersonPoliticalAffiliationCategoryAbbreviation } from '@/utils/dtsi/dtsiPersonUtils'
import { RacesData } from '@/utils/server/decisionDesk/types'
import { twNoop } from '@/utils/web/cn'

export const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-gray-400')
  }
  if (score > 50) {
    return twNoop('bg-green-700')
  }
  if (score === 50) {
    return twNoop('bg-yellow-600')
  }
  return twNoop('bg-red-700')
}

export const getPoliticalCategoryAbbr = (category: DTSI_PersonPoliticalAffiliationCategory) => {
  if (!category) return ''
  return dtsiPersonPoliticalAffiliationCategoryAbbreviation(category) || ''
}

export const getTotalVotes = (candidate: DTSI_DDHQ_Candidate | null, raceData: RacesData) => {
  if (!candidate) return 0
  return raceData?.topline_results?.votes?.[candidate.cand_id] || 0
}

export const getVotePercentage = (candidate: DTSI_DDHQ_Candidate | null, raceData: RacesData) => {
  if (!candidate) return 0
  const totalVotes = raceData?.topline_results?.total_votes
  if (isNil(totalVotes)) return 0
  const candidateVotes = raceData.topline_results?.votes?.[candidate.cand_id]
  return candidateVotes ? ((candidateVotes / totalVotes) * 100).toFixed(2) : 0
}

export const getOpacity = (candidate: DTSI_DDHQ_Candidate | null, raceData: RacesData) => {
  const calledCandidateId = raceData?.topline_results?.called_candidates?.[0]
  if (!calledCandidateId) return 'opacity-100'
  if (!candidate) return 'opacity-100'
  if (calledCandidateId !== candidate.cand_id) return 'opacity-50'
  return 'opacity-100'
}

export const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}
