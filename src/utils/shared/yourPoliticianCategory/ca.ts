import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'

export type YourPoliticianCategory = 'senate' | 'house-of-commons'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house-of-commons',
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
    case 'house-of-commons':
      return maxCount === 1 ? 'Member of Parliament' : 'Members of Parliament'
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
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
    case 'house-of-commons':
      return maxCount === 1 ? 'MP' : 'MPs'
    case 'senate':
      return maxCount === 1 ? 'senator' : 'senators'
  }
}

export function filterDTSIPeopleByPoliticalCategory(category: YourPoliticianCategory) {
  return (
    dtsiPeople: DTSIPeopleByCongressionalDistrictQueryResult,
  ): DTSIPeopleByCongressionalDistrictQueryResult => {
    switch (category) {
      case 'senate':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.SENATE,
        )
      case 'house-of-commons':
        return dtsiPeople.filter(
          person => person.primaryRole?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        )
      default:
        return dtsiPeople
    }
  }
}
