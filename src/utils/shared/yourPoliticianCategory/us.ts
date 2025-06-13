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

export function getYourPoliticianCategoryDisplayName(
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
  return (
    dtsiPeople: DTSIPeopleByElectoralZoneQueryResult,
  ): DTSIPeopleByElectoralZoneQueryResult => {
    switch (category) {
      case 'senate':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE,
        )
      case 'house':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
        )
      case 'senate-and-house':
        return dtsiPeople.filter(
          person =>
            person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE ||
            person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
        )
      case 'legislative-and-executive':
        return dtsiPeople.filter(
          person =>
            person.primaryRole?.roleCategory &&
            LEGISLATIVE_AND_EXECUTIVE_ROLE_CATEGORIES.includes(person.primaryRole.roleCategory),
        )
      default:
        return dtsiPeople
    }
  }
}
