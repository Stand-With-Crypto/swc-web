import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export function organizeStateSpecificPeople(
  congress: DTSI_StateSpecificInformationQuery['congress'],
  governor: DTSI_StateSpecificInformationQuery['governor'],
) {
  const preFormattedGovernors = governor.map(x =>
    formatSpecificRoleDTSIPerson(x, { specificRole: DTSI_PersonRoleCategory.GOVERNOR }),
  )
  const preFormattedCongress = congress.map(x => formatSpecificRoleDTSIPerson(x))

  const formatted = [...preFormattedCongress, ...preFormattedGovernors]
  const grouped = {
    senators: [] as (typeof formatted)[number][],
    congresspeople: {} as Record<
      NormalizedDTSIDistrictId,
      {
        district: NormalizedDTSIDistrictId
        people: (typeof formatted)[number][]
      }
    >,
    governors: [] as (typeof formatted)[number][],
  }

  const sortPeople = (a: (typeof formatted)[number], b: (typeof formatted)[number]) => {
    const lastNameA = a.lastName
    const lastNameB = b.lastName

    if (lastNameA !== lastNameB) {
      return lastNameA.localeCompare(lastNameB)
    }

    const scoreA = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
    const scoreB = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }

    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

    return 0
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
    } else if (person.runningForSpecificRole?.roleCategory === DTSI_PersonRoleCategory.GOVERNOR) {
      grouped.governors.push(person)
    }
  })

  grouped.senators.sort(sortPeople)
  grouped.governors.sort(sortPeople)

  Object.values(grouped.congresspeople).forEach(group => {
    group.people.sort(sortPeople)
  })

  return grouped
}
