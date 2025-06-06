import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPeopleByCongressionalDistrictQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByCongressionalDistrict'

export type YourPoliticianCategory = 'senate'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = ['senate']

export function getYourPoliticianCategoryDisplayName(
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
      default:
        return dtsiPeople
    }
  }
}
