import { isNil } from 'lodash-es'

import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'

export type DTSIPersonDataTablePeople = Awaited<ReturnType<typeof queryDTSIAllPeople>>['people']

export function sortDTSIPersonDataTable(data: DTSIPersonDataTablePeople) {
  const results = [...data]
  results.sort((personA, personB) => {
    if (personA.promotedPositioning) {
      return personB.promotedPositioning
        ? personA.promotedPositioning - personB.promotedPositioning
        : -1
    }
    if (personB.promotedPositioning) {
      return 1
    }

    // At this point you already verified that neither personA or personB have `promotedPositioning`
    const aScore = personA.manuallyOverriddenStanceScore || personA.computedStanceScore
    const bScore = personB.manuallyOverriddenStanceScore || personB.computedStanceScore
    if (aScore === bScore || (isNil(aScore) && isNil(bScore))) {
      return personA.lastName < personB.lastName ? -1 : 1
    }
    if (isNil(aScore)) {
      return 1
    }
    if (isNil(bScore)) {
      return -1
    }
    return bScore - aScore
  })
  return results
}
