import { FormattedPerson } from '@/components/app/pageLocationRaceSpecific/types'
import { DTSI_PersonRoleCategory, DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'

export function organizeStateSpecificPeople({
  runningForPresident,
}: DTSI_UnitedStatesInformationQuery) {
  const formatted = runningForPresident.map(x => formatSpecificRoleDTSIPerson(x))
  const grouped = {
    runningFor: {
      president: {
        incumbents: [] as FormattedPerson[],
        candidates: [] as FormattedPerson[],
      },
    },
  }
  formatted.forEach(person => {
    if (person.roles.some(x => x.roleCategory === DTSI_PersonRoleCategory.PRESIDENT)) {
      if (person.slug === 'joseph---biden') {
        grouped.runningFor.president.incumbents.push(person)
      } else {
        grouped.runningFor.president.candidates.push(person)
      }
    } else {
      gracefullyError({
        msg: 'Unexpected runningForSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  return grouped
}
