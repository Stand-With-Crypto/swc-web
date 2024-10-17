import { useMemo } from 'react'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

export const useCandidateSelection = (candidates: DTSI_Candidate[]) => {
  return useMemo(() => {
    let recommended: DTSI_Candidate | undefined
    let democrat: DTSI_Candidate | undefined
    let republican: DTSI_Candidate | undefined
    let other: DTSI_Candidate | undefined

    for (const candidate of candidates) {
      if (candidate.isRecommended && !recommended) {
        recommended = candidate
      }

      switch (candidate.politicalAffiliationCategory) {
        case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
          if (!democrat) democrat = candidate
          break
        case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
          if (!republican) republican = candidate
          break
        default:
          if (!other) other = candidate
      }

      if (recommended && democrat && republican) break
    }

    const firstChoice = recommended || democrat || republican || other
    let secondChoice: DTSI_Candidate | undefined

    if (firstChoice) {
      secondChoice =
        democrat && democrat.id !== firstChoice.id
          ? democrat
          : republican && republican.id !== firstChoice.id
            ? republican
            : other && other.id !== firstChoice.id
              ? other
              : undefined
    }

    return [firstChoice, secondChoice].filter((c): c is DTSI_Candidate => !!c)
  }, [candidates])
}
