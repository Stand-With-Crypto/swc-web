import { caFormatSpecificRoleDTSIPerson } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/specificRoleDTSIPerson'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

export function organizeCARaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
) {
  const formatted = people.map(x => caFormatSpecificRoleDTSIPerson(x))

  formatted.sort((a, b) => {
    const aPersonScore = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
    const bPersonScore = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

    if (aPersonScore !== bPersonScore) {
      return bPersonScore - aPersonScore
    }

    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }

    return 0
  })

  return formatted
}
