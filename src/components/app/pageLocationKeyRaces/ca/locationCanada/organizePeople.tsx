import { groupBy } from 'lodash-es'

import { formatSpecificRoleDTSIPersonCA } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/specificRoleDTSIPerson'
import { QueryDTSILocationCanadaInformationData } from '@/data/dtsi/queries/ca/queryDTSILocationCanadaInformation'

export function organizePeopleCA({ keyRaces }: QueryDTSILocationCanadaInformationData) {
  const formattedKeyRaces = keyRaces.map(x => formatSpecificRoleDTSIPersonCA(x))

  type GroupedRaces = Record<string, (typeof formattedKeyRaces)[]>

  const groupedByState = groupBy(formattedKeyRaces, x => x.runningForSpecificRole?.primaryState)

  const groupedKeyRaces: GroupedRaces = Object.keys(groupedByState).reduce((group, state) => {
    const racesInState = groupedByState[state]
    const groupedByDistrict = groupBy(
      racesInState,
      x => x.runningForSpecificRole?.primaryDistrict || 'no-district',
    )

    const sortedGroupedByDistrict = Object.keys(groupedByDistrict).map(district => {
      const racesInDistrict = groupedByDistrict[district]

      racesInDistrict.sort((a, b) => {
        if (a.isIncumbent !== b.isIncumbent) {
          return a.isIncumbent ? -1 : 1
        }

        const scoreA = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
        const scoreB = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

        if (scoreA !== scoreB) {
          return scoreB - scoreA
        }

        if (a.profilePictureUrl !== b.profilePictureUrl) {
          return a.profilePictureUrl ? -1 : 1
        }

        return 0
      })

      return racesInDistrict
    })

    group[state as string] = sortedGroupedByDistrict
    return group
  }, {} as GroupedRaces)

  return {
    keyRaces: groupedKeyRaces,
  }
}
