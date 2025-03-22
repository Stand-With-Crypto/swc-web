import { groupBy } from 'lodash-es'

import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { QueryDTSILocationUnitedStatesInformationData } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function organizePeople({
  runningForPresident,
  keyRaces,
}: QueryDTSILocationUnitedStatesInformationData) {
  const formattedKeyRaces = keyRaces.map(x => formatSpecificRoleDTSIPerson(x))
  const formattedPresident = runningForPresident.map(person =>
    formatSpecificRoleDTSIPerson(person, { specificRole: DTSI_PersonRoleCategory.PRESIDENT }),
  )

  type GroupedRaces = Record<USStateCode, (typeof formattedKeyRaces)[]>

  const groupedByState = groupBy(formattedKeyRaces, x => x.runningForSpecificRole.primaryState)

  const groupedKeyRaces: GroupedRaces = Object.keys(groupedByState).reduce((group, state) => {
    const racesInState = groupedByState[state]
    const groupedByDistrict = groupBy(
      racesInState,
      x => x.runningForSpecificRole.primaryDistrict || 'no-district',
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
        const aPriority = a[0].runningForSpecificRole.roleCategory
          ? rolePriority.indexOf(a[0].runningForSpecificRole.roleCategory)
          : -1
        const bPriority = b[0].runningForSpecificRole.roleCategory
          ? rolePriority.indexOf(b[0].runningForSpecificRole.roleCategory)
          : -1
        if (aPriority !== bPriority) return aPriority - bPriority
        return (a[0].runningForSpecificRole.primaryDistrict || '').localeCompare(
          b[0].runningForSpecificRole.primaryDistrict || '',
        )
      })

      return group
    },
    {} as GroupedRaces,
  )
  const partyOrder = [
    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  ]
  formattedPresident.sort((a, b) => {
    const aPartyIndex = a.politicalAffiliationCategory
      ? partyOrder.indexOf(a.politicalAffiliationCategory)
      : -1
    const bPartyIndex = b.politicalAffiliationCategory
      ? partyOrder.indexOf(b.politicalAffiliationCategory)
      : -1
    if (aPartyIndex !== bPartyIndex) {
      return aPartyIndex - bPartyIndex
    }
    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }
    return 0
  })

  return { president: formattedPresident, keyRaces: sortedGroupedKeyRaces }
}
