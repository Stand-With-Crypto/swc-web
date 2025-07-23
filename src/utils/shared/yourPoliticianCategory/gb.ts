import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'

export type YourPoliticianCategory = 'mp' | 'lord'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = ['mp', 'lord']

export function getGBPoliticianCategoryDisplayName(
  category: YourPoliticianCategory,
  {
    maxCount,
  }: {
    maxCount?: number
  } = {},
) {
  switch (category) {
    case 'mp':
      return maxCount === 1 ? 'Member of Parliament' : 'Members of Parliament'
    case 'lord':
      return maxCount === 1 ? 'Lord' : 'Lords'
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
    case 'mp':
      return maxCount === 1 ? 'MP' : 'MPs'
    case 'lord':
      return maxCount === 1 ? 'Lord' : 'Lords'
  }
}

export function filterDTSIPeopleByGBPoliticalCategory(category: YourPoliticianCategory) {
  return (dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number]): boolean => {
    switch (category) {
      case 'mp':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS
      case 'lord':
        return dtsiPerson.primaryRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS
      default:
        return true
    }
  }
}
