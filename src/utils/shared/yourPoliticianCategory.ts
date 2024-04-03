export type YourPoliticianCategory = 'senate' | 'house' | 'senate-and-house'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house',
  'senate-and-house',
]

export const DEFAULT_YOUR_POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate'

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
  }
}
