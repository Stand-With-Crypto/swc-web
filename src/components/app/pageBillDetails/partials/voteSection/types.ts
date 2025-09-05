import {
  DTSI_BillPersonRelationshipType,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

export const StandardOption = 'All'

export const StanceOptions = [
  StandardOption,
  DTSI_BillPersonRelationshipType.SPONSOR,
  DTSI_BillPersonRelationshipType.VOTED_FOR,
  DTSI_BillPersonRelationshipType.VOTED_AGAINST,
] as const

export type StanceOption = (typeof StanceOptions)[number]

export const RoleOptions = [
  StandardOption,
  DTSI_PersonRoleCategory.SENATE,
  DTSI_PersonRoleCategory.CONGRESS,
] as const

export type RoleOption = (typeof RoleOptions)[number]

export const PartyOptions = [
  StandardOption,
  DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
] as const

export type PartyOption = (typeof PartyOptions)[number]

export interface FilterKeys {
  stance: StanceOption
  role: RoleOption
  party: PartyOption
}
