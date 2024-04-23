import { DTSI_PersonRoleCategory, DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import {
  formatSpecificRoleDTSIPerson,
  SpecificRoleDTSIPerson,
} from '@/utils/dtsi/specificRoleDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'

type FormattedPerson = SpecificRoleDTSIPerson<
  DTSI_UnitedStatesInformationQuery['runningForPresident'][0]
>

export function organizePeople({ runningForPresident }: DTSI_UnitedStatesInformationQuery) {
  const formatted = runningForPresident.map(x =>
    formatSpecificRoleDTSIPerson(x, { specificRole: DTSI_PersonRoleCategory.PRESIDENT }),
  )
  const grouped = {
    president: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.roles.some(x => x.roleCategory === DTSI_PersonRoleCategory.PRESIDENT)) {
      grouped.president.push(person)
    } else {
      gracefullyError({
        msg: 'Unexpected runningForSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  grouped.president.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return grouped
}
