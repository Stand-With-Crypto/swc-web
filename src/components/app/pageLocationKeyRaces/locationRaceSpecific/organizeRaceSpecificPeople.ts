import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district, stateCode }: { district?: NormalizedDTSIDistrictId; stateCode?: USStateCode },
) {
  const targetedRoleCategory = district
    ? DTSI_PersonRoleCategory.CONGRESS
    : stateCode
      ? DTSI_PersonRoleCategory.SENATE
      : DTSI_PersonRoleCategory.PRESIDENT

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )

  const partyOrder = [
    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  ]

  formatted.sort((a, b) => {
    const aPartyIndex = a.politicalAffiliationCategory
      ? partyOrder.indexOf(a.politicalAffiliationCategory)
      : -1
    const bPartyIndex = b.politicalAffiliationCategory
      ? partyOrder.indexOf(b.politicalAffiliationCategory)
      : -1
    if (aPartyIndex !== bPartyIndex) {
      return aPartyIndex - bPartyIndex
    }

    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }

    return 0
  })

  return formatted
}
