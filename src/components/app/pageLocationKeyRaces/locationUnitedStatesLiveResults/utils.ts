import { isNil } from 'lodash-es'

import {
  CandidatesWithVote,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/getAllRacesData'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { dtsiPersonPoliticalAffiliationCategoryAbbreviation } from '@/utils/dtsi/dtsiPersonUtils'
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

export const getVotePercentage = (
  candidate: CandidatesWithVote | null,
  raceData: RacesVotingDataResponse | null,
) => {
  if (!candidate) return 0
  const totalVotes = raceData?.totalVotes
  if (isNil(totalVotes)) return 0
  return candidate.votes ? ((candidate.votes / totalVotes) * 100).toFixed(2) : 0
}

export const getOpacity = (
  candidate: CandidatesWithVote | null,
  raceData: RacesVotingDataResponse | null,
) => {
  const calledCandidate = raceData?.calledCandidate
  if (!calledCandidate) return 'opacity-100'
  if (!candidate) return 'opacity-100'
  if (calledCandidate.cand_id !== candidate.id) return 'opacity-50'
  return 'opacity-100'
}

export const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}
