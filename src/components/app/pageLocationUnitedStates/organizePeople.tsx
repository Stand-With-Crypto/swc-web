import { groupBy } from 'lodash-es'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { QueryDTSILocationUnitedStatesInformationData } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export function organizePeople({
  runningForPresident,
  keyRaces,
}: QueryDTSILocationUnitedStatesInformationData) {
  const formattedKeyRaces = keyRaces.map(x => formatSpecificRoleDTSIPerson(x))
  const formattedPresident = runningForPresident.map(person =>
    formatSpecificRoleDTSIPerson(person, { specificRole: DTSI_PersonRoleCategory.PRESIDENT }),
  )
  const groupedKeyRaces = Object.values(
    groupBy(
      formattedKeyRaces,
      x => `${x.runningForSpecificRole.primaryState}-${x.runningForSpecificRole.primaryDistrict}`,
    ),
  )

  groupedKeyRaces.forEach(race => {
    race.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  })
  const rolePriority: DTSI_PersonRoleCategory[] = [
    DTSI_PersonRoleCategory.SENATE,
    DTSI_PersonRoleCategory.CONGRESS,
  ]
  groupedKeyRaces.sort((a, b) => {
    const aState = a[0].runningForSpecificRole.primaryState
    const bState = b[0].runningForSpecificRole.primaryState
    if (aState !== bState) return aState.localeCompare(bState)
    const aPriority = a[0].runningForSpecificRole.roleCategory
      ? rolePriority.indexOf(a[0].runningForSpecificRole.roleCategory)
      : -1
    const bPriority = b[0].runningForSpecificRole.roleCategory
      ? rolePriority.indexOf(b[0].runningForSpecificRole.roleCategory)
      : -1
    if (aPriority !== bPriority) return aPriority - bPriority
    return a[0].runningForSpecificRole.primaryDistrict.localeCompare(
      b[0].runningForSpecificRole.primaryDistrict,
    )
  })
  formattedPresident.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return { president: formattedPresident, keyRaces: groupedKeyRaces }
}
