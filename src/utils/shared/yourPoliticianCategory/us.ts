import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'

export type YourPoliticianCategory =
  | 'senate'
  | 'house'
  | 'senate-and-house'
  | 'legislative-and-executive'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house',
  'senate-and-house',
  'legislative-and-executive',
]

export const LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES = [
  DTSI_PersonRoleCategory.SENATE,
  DTSI_PersonRoleCategory.CONGRESS,
  DTSI_PersonRoleCategory.GOVERNOR,
  DTSI_PersonRoleCategory.ATTORNEY_GENERAL,
  DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
]

export function getUSPoliticianCategoryDisplayName(
  category: YourPoliticianCategory,
  {
    maxCount,
  }: {
    maxCount?: number
  } = {},
) {
  switch (category) {
    case 'house':
      return 'congressperson'
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
    case 'senate-and-house':
      return maxCount === 1 ? 'politician' : 'senators and congressperson'
    case 'legislative-and-executive':
      return 'politicians'
  }
}
export function getYourPoliticianCategoryShortDisplayName(
  category: YourPoliticianCategory,
  {
    maxCount,
  }: {
    maxCount?: number
  } = {},
) {
  switch (category) {
    case 'house':
      return 'congressperson'
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
    case 'senate-and-house':
      return maxCount === 1 ? 'politician' : 'politicians'
    case 'legislative-and-executive':
      return 'politicians'
  }
}

export function filterDTSIPeopleByUSPoliticalCategory(category: YourPoliticianCategory) {
  return (dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number]): boolean => {
    switch (category) {
      case 'senate':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE
      case 'house':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS
      case 'senate-and-house':
        return (
          dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE ||
          dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS
        )
      case 'legislative-and-executive':
        return Boolean(
          dtsiPerson.primaryRole?.roleCategory &&
            LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES.includes(dtsiPerson.primaryRole.roleCategory),
        )
      default:
        return true
    }
  }
}
