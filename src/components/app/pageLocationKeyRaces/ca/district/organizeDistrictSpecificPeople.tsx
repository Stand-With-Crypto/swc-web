import {
  caFormatSpecificRoleDTSIPerson,
  CASpecificRoleDTSIPerson,
} from '@/components/app/pageLocationKeyRaces/ca/locationCanada/specificRoleDTSIPerson'
import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'

type FormattedPerson = CASpecificRoleDTSIPerson<DTSI_StateSpecificInformationQuery['people'][0]>
export function organizeCADistrictSpecificPeople(
  people: DTSI_StateSpecificInformationQuery['people'],
) {
  const formatted = people.map(x => caFormatSpecificRoleDTSIPerson(x))
  const grouped = {
    houseOfCommons: [] as FormattedPerson[],
    senate: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS) {
      grouped.houseOfCommons.push(person)
    } else if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.SENATE) {
      grouped.senate.push(person)
    }
  })
  grouped.houseOfCommons.sort((a, b) =>
    a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1,
  )
  grouped.senate.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))

  return grouped
}
