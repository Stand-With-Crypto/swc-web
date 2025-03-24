import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'

import { FormattedPerson } from './types'

export function organizeStateSpecificPeople(people: DTSI_StateSpecificInformationQuery['people']) {
  const formatted = people.map(x => formatSpecificRoleDTSIPerson(x))
  const grouped = {
    senators: [] as FormattedPerson[],
    congresspeople: {} as Record<
      NormalizedDTSIDistrictId,
      {
        district: NormalizedDTSIDistrictId
        people: FormattedPerson[]
      }
    >,
  }
  formatted.forEach(person => {
    if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.SENATE) {
      grouped.senators.push(person)
    } else if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS) {
      const district = normalizeDTSIDistrictId(person.runningForSpecificRole)
      if (district) {
        if (!grouped.congresspeople[district]) {
          grouped.congresspeople[district] = {
            district,
            people: [],
          }
        }
        grouped.congresspeople[district].people.push(person)
      }
    } else {
      gracefullyError({
        msg: 'Unexpected runningForSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  grouped.senators.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  Object.values(grouped.congresspeople).forEach(group => {
    group.people.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  })
  return grouped
}
