import { flatten } from 'lodash-es'

export function listOfThings<T extends string | React.ReactNode>(items: T[], conjunction = 'and') {
  if (items.length < 2) {
    return items
  }
  if (items.length === 2) {
    return [items[0], ` ${conjunction} `, items[1]]
  }
  return flatten(
    items.map((item, index) => {
      if (index < items.length - 2) {
        return [item, ', ']
      }
      if (index === items.length - 2) {
        return [item, `, ${conjunction} `]
      }
      return item
    }),
  )
}
