import { useMemo } from 'react'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

export const useCandidateSelection = (candidates: DTSI_Candidate[]) => {
  return useMemo(() => {
    const recommendedCandidate = candidates.find(c => c.isRecommended)

    function findPartyCandidate(party: DTSI_PersonPoliticalAffiliationCategory) {
      return candidates.find(
        c => c.politicalAffiliationCategory === party && c.id !== recommendedCandidate?.id,
      )
    }

    const democratCandidate = findPartyCandidate(DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT)
    const republicanCandidate = findPartyCandidate(
      DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    )

    const fallbackCandidate = candidates.find(
      c =>
        c.id !== recommendedCandidate?.id &&
        c.id !== democratCandidate?.id &&
        c.id !== republicanCandidate?.id,
    )

    const selectedCandidates: (DTSI_Candidate | undefined)[] = [
      recommendedCandidate,
      democratCandidate || republicanCandidate || fallbackCandidate,
    ]

    // Filter out undefined values and ensure we have at most 2 candidates
    return selectedCandidates.filter((c): c is DTSI_Candidate => !!c).slice(0, 2)
  }, [candidates])
}
