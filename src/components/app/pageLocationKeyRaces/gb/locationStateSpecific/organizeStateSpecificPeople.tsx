import { formatSpecificRoleDTSIPersonGB } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/specificRoleDTSIPerson'
import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { gracefullyError } from '@/utils/shared/gracefullyError'

import { FormattedPerson } from './types'

export function organizeStateSpecificPeople(people: DTSI_StateSpecificInformationQuery['people']) {
  const formatted = people.map(x => formatSpecificRoleDTSIPersonGB(x))
  const grouped = {
    houseOfCommons: [] as FormattedPerson[],
    houseOfLords: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS) {
      grouped.houseOfCommons.push(person)
    } else if (
      person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS
    ) {
      grouped.houseOfLords.push(person)
    } else {
      gracefullyError({
        msg: 'Unexpected runningForSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  grouped.houseOfCommons.sort((a, b) =>
    a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1,
  )
  grouped.houseOfLords.sort((a, b) =>
    a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1,
  )

  return grouped
}
