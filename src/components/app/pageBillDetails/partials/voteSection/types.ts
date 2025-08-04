import {
  DTSI_BillPersonRelationshipType,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

export const STANDARD_OPTION = 'All'

export const STANCE_OPTIONS = [
  STANDARD_OPTION,
  DTSI_BillPersonRelationshipType.SPONSOR,
  DTSI_BillPersonRelationshipType.VOTED_FOR,
  DTSI_BillPersonRelationshipType.VOTED_AGAINST,
] as const

export type STANCE_OPTION = (typeof STANCE_OPTIONS)[number]

export const ROLE_OPTIONS = [
  STANDARD_OPTION,
  DTSI_PersonRoleCategory.SENATE,
  DTSI_PersonRoleCategory.CONGRESS,
] as const

export type ROLE_OPTION = (typeof ROLE_OPTIONS)[number]

export const PARTY_OPTIONS = [
  STANDARD_OPTION,
  DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
] as const

export type PARTY_OPTION = (typeof PARTY_OPTIONS)[number]

export interface FILTER_KEYS {
  stance: STANCE_OPTION
  role: ROLE_OPTION
  party: PARTY_OPTION
}
