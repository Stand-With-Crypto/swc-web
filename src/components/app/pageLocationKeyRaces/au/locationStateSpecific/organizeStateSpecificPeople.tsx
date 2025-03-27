import { formatSpecificRoleDTSIPersonAU } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/specificRoleDTSIPerson'
import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { gracefullyError } from '@/utils/shared/gracefullyError'

import { FormattedPerson } from './types'

export function organizeStateSpecificPeople(people: DTSI_StateSpecificInformationQuery['people']) {
  const formatted = people.map(x => formatSpecificRoleDTSIPersonAU(x))
  const grouped = {
    houseOfReps: [] as FormattedPerson[],
    senate: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS) {
      grouped.houseOfReps.push(person)
    } else if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.SENATE) {
      grouped.senate.push(person)
    } else {
      gracefullyError({
        msg: 'Unexpected runningForSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  grouped.houseOfReps.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  grouped.senate.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))

  return grouped
}
