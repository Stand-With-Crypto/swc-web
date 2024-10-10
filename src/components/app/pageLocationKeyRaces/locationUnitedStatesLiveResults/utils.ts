import { isNil } from 'lodash-es'

import {
  CandidatesWithVote,
  GetAllCongressDataResponse,
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
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
  return candidate.votes ? +((candidate.votes / totalVotes) * 100).toFixed(2) : 0
}

export const getOpacity = (
  candidate: CandidatesWithVote | null,
  raceData: RacesVotingDataResponse | null,
) => {
  if (!candidate) return 'opacity-100'
  if (candidate.elected) return 'opacity-100'

  const calledCandidate = raceData?.calledCandidate
  if (!calledCandidate) return 'opacity-100'

  return calledCandidate.cand_id === candidate.id ? 'opacity-100' : 'opacity-50'
}

export const congressLiveResultOverview = (
  data: GetAllCongressDataResponse['senateDataWithDtsi'] | undefined,
) => {
  if (!data?.candidatesWithVotes?.length) {
    return { proCryptoCandidatesElected: 0, antiCryptoCandidatesElected: 0 }
  }

  return data.candidatesWithVotes.reduce(
    (acc, candidate) => {
      if (!candidate?.dtsiData) return acc

      if (!candidate.elected) return acc

      const stanceScore =
        candidate.dtsiData.manuallyOverriddenStanceScore || candidate.dtsiData.computedStanceScore
      if (isNil(stanceScore)) return acc

      if (stanceScore > 50) {
        acc.proCryptoCandidatesElected += 1
      } else {
        acc.antiCryptoCandidatesElected += 1
      }
      return acc
    },
    { proCryptoCandidatesElected: 0, antiCryptoCandidatesElected: 0 },
  )
}

export function isPresidentialData(
  data: RacesVotingDataResponse[] | PresidentialDataWithVotingResponse[] | null,
): data is PresidentialDataWithVotingResponse[] {
  return 'votingData' in (data?.[0] || {})
}

export const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}
