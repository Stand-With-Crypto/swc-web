import { useMemo } from 'react'

import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { DTSIPersonDetails, DTSIPersonStance } from '@/data/dtsi/queries/queryDTSIPersonDetails'

type PersonStance = DTSIPersonDetails['stances'][0]

export interface CategorizedStances {
  billRelationship: DTSIPersonStance[]
  noBillRelationship: DTSIPersonStance[]
}

/**
 * Hook that categorizes person stances into bill relationships and non-bill relationships
 * @param stances Array of person stances to categorize
 * @returns Object containing billRelationship and noBillRelationship arrays
 */
export function useCategorizedStances(stances: DTSIPersonStance[]): CategorizedStances {
  const result = useMemo(() => {
    const billRelationship: DTSIPersonStance[] = []
    const noBillRelationship: DTSIPersonStance[] = []

    for (const stance of stances) {
      if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
        billRelationship.push(stance)
      } else {
        noBillRelationship.push(stance)
      }
    }

    return {
      billRelationship,
      noBillRelationship,
    }
  }, [stances])

  return result
}
