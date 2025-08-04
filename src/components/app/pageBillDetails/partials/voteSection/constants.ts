import {
  DTSI_BillPersonRelationshipType,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

import type { FilterKeys, PartyOption, RoleOption, StanceOption } from './types'
import { StandardOption } from './types'

export const StanceOptionsDisplayName: Record<StanceOption, string> = {
  [StandardOption]: StandardOption,
  [DTSI_BillPersonRelationshipType.SPONSOR]: 'Sponsor & Co-sponsors',
  [DTSI_BillPersonRelationshipType.VOTED_FOR]: 'Voted for',
  [DTSI_BillPersonRelationshipType.VOTED_AGAINST]: 'Voted against',
}

export const RoleOptionsDisplayName: Record<RoleOption, string> = {
  [StandardOption]: StandardOption,
  [DTSI_PersonRoleCategory.SENATE]: 'Senator',
  [DTSI_PersonRoleCategory.CONGRESS]: 'Congressperson',
}

export const PartyOptionsDisplayName: Record<PartyOption, string> = {
  [StandardOption]: StandardOption,
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'Republican',
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'Democratic',
}

export const getDefaultFilters = (): FilterKeys => ({
  stance: StandardOption,
  role: StandardOption,
  party: StandardOption,
})
