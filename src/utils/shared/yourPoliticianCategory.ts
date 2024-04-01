export type YourPoliticianCategory = 'senate' | 'house' | 'senate-and-house'

export const YOUR_POLITICIAN_CATEGORY_OPTIONS: readonly YourPoliticianCategory[] = [
  'senate',
  'house',
  'senate-and-house',
]

export const DEFAULT_YOUR_POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate'

export function getYourPoliticianCategoryDisplayName(category: YourPoliticianCategory) {
  switch (category) {
    case 'house':
      return 'congressperson'
    case 'senate':
      return 'senators'
    case 'senate-and-house':
      return 'senators and congressperson'
  }
}
