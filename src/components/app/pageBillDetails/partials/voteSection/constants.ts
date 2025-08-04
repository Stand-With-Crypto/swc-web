import {
  DTSI_BillPersonRelationshipType,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

import type { FILTER_KEYS, PARTY_OPTION, ROLE_OPTION, STANCE_OPTION } from './types'
import { STANDARD_OPTION } from './types'

export const STANCE_OPTIONS_DISPLAY_NAME: Record<STANCE_OPTION, string> = {
  [STANDARD_OPTION]: STANDARD_OPTION,
  [DTSI_BillPersonRelationshipType.SPONSOR]: 'Sponsor & Co-sponsors',
  [DTSI_BillPersonRelationshipType.VOTED_FOR]: 'Voted for',
  [DTSI_BillPersonRelationshipType.VOTED_AGAINST]: 'Voted against',
}

export const ROLE_OPTIONS_DISPLAY_NAME: Record<ROLE_OPTION, string> = {
  [STANDARD_OPTION]: STANDARD_OPTION,
  [DTSI_PersonRoleCategory.SENATE]: 'Senator',
  [DTSI_PersonRoleCategory.CONGRESS]: 'Congressperson',
}

export const PARTY_OPTIONS_DISPLAY_NAME: Record<PARTY_OPTION, string> = {
  [STANDARD_OPTION]: STANDARD_OPTION,
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'Republican',
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'Democratic',
}

export const getDefaultFilters = (): FILTER_KEYS => ({
  stance: STANDARD_OPTION,
  role: STANDARD_OPTION,
  party: STANDARD_OPTION,
})
