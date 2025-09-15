import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'

export type YourPoliticianCategory = 'mep' | 'commissioner' | 'all'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'mep',
  'commissioner',
  'all',
]

export function getEUPoliticianCategoryDisplayName(
  category: YourPoliticianCategory,
  {
    maxCount,
  }: {
    maxCount?: number
  } = {},
) {
  switch (category) {
    case 'mep':
      return maxCount === 1 ? 'Member of European Parliament' : 'Members of European Parliament'
    case 'commissioner':
      return maxCount === 1 ? 'European Commissioner' : 'European Commissioners'
    case 'all':
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
    case 'mep':
      return maxCount === 1 ? 'MEP' : 'MEPs'
    case 'commissioner':
      return maxCount === 1 ? 'Commissioner' : 'Commissioners'
    case 'all':
      return maxCount === 1 ? 'politician' : 'politicians'
  }
}

export function filterDTSIPeopleByEUPoliticalCategory(category: YourPoliticianCategory) {
  return (dtsiPerson: DTSIPeopleByElectoralZoneQueryResult[number]): boolean => {
    // TODO(EU): Add EU-specific political category filter
    return true
  }
}
