import { groupBy } from 'lodash-es'

import { DTSI_PersonRoleCategory, DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export function organizePeople({
  runningForPresident,
  keySenateRaces,
}: DTSI_UnitedStatesInformationQuery) {
  const formattedKeySenateRaces = keySenateRaces.map(x =>
    formatSpecificRoleDTSIPerson(x, { specificRole: DTSI_PersonRoleCategory.SENATE }),
  )
  const grouped = {
    president: runningForPresident.map(x =>
      formatSpecificRoleDTSIPerson(x, { specificRole: DTSI_PersonRoleCategory.PRESIDENT }),
    ),
    keySenateRaceMap: groupBy(formattedKeySenateRaces, x => x.runningForSpecificRole.primaryState!),
  }
  Object.values(grouped.keySenateRaceMap).forEach(race => {
    race.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  })
  grouped.president.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return grouped
}
