import { isNil } from 'lodash-es'

import { DTSI_DDHQ_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { RacesData } from '@/data/decisionDesk/types'

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
