import { auFormatSpecificRoleDTSIPerson } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/specificRoleDTSIPerson'
import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'

export function organizeAUStateSpecificPeople(
  congress: DTSI_StateSpecificInformationQuery['congress'],
) {
  const formattedCongress = congress.map(x => auFormatSpecificRoleDTSIPerson(x))

  const formatted = [...formattedCongress]

  const grouped = {
    senators: [] as (typeof formatted)[number][],
  }

  const sortPeople = (a: (typeof formatted)[number], b: (typeof formatted)[number]) => {
    /**
     * Sorting by profile picture first because most candidates do not have a profile picture
     */
    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

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
    }
  })

  grouped.senators.sort(sortPeople)

  return grouped
}
