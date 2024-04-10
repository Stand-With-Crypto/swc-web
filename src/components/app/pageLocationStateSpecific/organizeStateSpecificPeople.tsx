import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { formatStateSpecificDTSIPerson } from '@/utils/dtsi/stateSpecificDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'

import { FormattedPerson } from './types'

export function organizeStateSpecificPeople(people: DTSI_StateSpecificInformationQuery['people']) {
  const formatted = people.map(x => formatStateSpecificDTSIPerson(x))
  const grouped = {
    runningFor: {
      senators: {
        incumbents: [] as FormattedPerson[],
        candidates: [] as FormattedPerson[],
      },
      congresspeople: {} as Record<
        NormalizedDTSIDistrictId,
        {
          district: NormalizedDTSIDistrictId
          incumbents: FormattedPerson[]
          candidates: FormattedPerson[]
        }
      >,
    },
  }
  formatted.forEach(person => {
    if (person.runningForStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.SENATE) {
      if (
        person.currentStateSpecificRole &&
        person.currentStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.SENATE
      ) {
        grouped.runningFor.senators.incumbents.push(person)
      } else {
        grouped.runningFor.senators.candidates.push(person)
      }
    } else if (
      person.runningForStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS
    ) {
      const district = normalizeDTSIDistrictId(person.runningForStateSpecificRole)
      if (district) {
        if (!grouped.runningFor.congresspeople[district]) {
          grouped.runningFor.congresspeople[district] = {
            district,
            incumbents: [],
            candidates: [],
          }
        }
        if (
          person.currentStateSpecificRole &&
          person.currentStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS
        ) {
          grouped.runningFor.congresspeople[district].incumbents.push(person)
        } else {
          grouped.runningFor.congresspeople[district].candidates.push(person)
        }
      }
    } else {
      gracefullyError({
        msg: 'Unexpected runningForStateSpecificRole',
        fallback: null,
        hint: { extra: { person } },
      })
    }
  })
  return grouped
}
