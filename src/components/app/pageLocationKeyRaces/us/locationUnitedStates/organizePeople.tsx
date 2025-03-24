import { groupBy } from 'lodash-es'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { QueryDTSILocationUnitedStatesInformationData } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function organizePeople({ keyRaces }: QueryDTSILocationUnitedStatesInformationData) {
  const formattedKeyRaces = keyRaces.map(x =>
    formatSpecificRoleDTSIPerson(x, { specificRole: DTSI_PersonRoleCategory.GOVERNOR }),
  )

  type GroupedRaces = Record<USStateCode, (typeof formattedKeyRaces)[]>

  const groupedByState = groupBy(formattedKeyRaces, x => x.runningForSpecificRole?.primaryState)

  const groupedKeyRaces: GroupedRaces = Object.keys(groupedByState).reduce((group, state) => {
    const racesInState = groupedByState[state]
    const groupedByDistrict = groupBy(
      racesInState,
      x => x.runningForSpecificRole?.primaryDistrict || 'no-district',
    )

    const sortedGroupedByDistrict = Object.keys(groupedByDistrict).map(district => {
      const racesInDistrict = groupedByDistrict[district]
      racesInDistrict.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
      return racesInDistrict
    })

    group[state as USStateCode] = sortedGroupedByDistrict
    return group
  }, {} as GroupedRaces)

  const rolePriority: DTSI_PersonRoleCategory[] = [
    DTSI_PersonRoleCategory.SENATE,
    DTSI_PersonRoleCategory.CONGRESS,
  ]

  const sortedGroupedKeyRaces: GroupedRaces = Object.keys(groupedKeyRaces).reduce(
    (group, state) => {
      group[state as USStateCode] = groupedKeyRaces[state as USStateCode].sort((a, b) => {
        const aPriority = a[0].runningForSpecificRole?.roleCategory
          ? rolePriority.indexOf(a[0].runningForSpecificRole.roleCategory)
          : -1
        const bPriority = b[0].runningForSpecificRole?.roleCategory
          ? rolePriority.indexOf(b[0].runningForSpecificRole.roleCategory)
          : -1

        if (aPriority !== bPriority) return aPriority - bPriority
        return (a[0].runningForSpecificRole?.primaryDistrict || '').localeCompare(
          b[0].runningForSpecificRole?.primaryDistrict || '',
        )
      })

      return group
    },
    {} as GroupedRaces,
  )

  return {
    keyRaces: sortedGroupedKeyRaces,
  }
}
