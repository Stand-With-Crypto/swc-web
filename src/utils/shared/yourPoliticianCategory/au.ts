import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'

export type YourPoliticianCategory = 'senate' | 'house-of-reps' | 'senate-and-house'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house-of-reps',
  'senate-and-house',
]

export function getAUPoliticianCategoryDisplayName(
  category: YourPoliticianCategory,
  {
    maxCount,
  }: {
    maxCount?: number
  } = {},
) {
  switch (category) {
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
    case 'house-of-reps':
      return maxCount === 1 ? 'representative' : 'representatives'
    case 'senate-and-house':
      return maxCount === 1 ? 'politician' : 'politicians'
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
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
    case 'house-of-reps':
      return maxCount === 1 ? 'representative' : 'representatives'
    case 'senate-and-house':
      return maxCount === 1 ? 'politician' : 'politicians'
  }
}

export function filterDTSIPeopleByAUPoliticalCategory(category: YourPoliticianCategory) {
  return (dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number]): boolean => {
    switch (category) {
      case 'senate':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE
      case 'house-of-reps':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS
      case 'senate-and-house':
        return (
          dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE ||
          dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS
        )
      default:
        return true
    }
  }
}
