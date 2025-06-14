import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'

export type YourPoliticianCategory = 'senate' | 'house-of-reps'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house-of-reps',
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
      return maxCount === 1 ? 'Senator' : 'Senators'
    case 'house-of-reps':
      return maxCount === 1 ? 'Representative' : 'Representatives'
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
      return maxCount === 1 ? 'Senator' : 'Senators'
    case 'house-of-reps':
      return maxCount === 1 ? 'Representative' : 'Representatives'
  }
}

export function filterDTSIPeopleByAUPoliticalCategory(category: YourPoliticianCategory) {
  return (
    dtsiPeople: DTSIPeopleByElectoralZoneQueryResult,
  ): DTSIPeopleByElectoralZoneQueryResult => {
    switch (category) {
      case 'senate':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE,
        )
      case 'house-of-reps':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
        )
      default:
        return dtsiPeople
    }
  }
}
