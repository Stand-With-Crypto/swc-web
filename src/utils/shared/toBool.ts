export function toBool(item: string | number | undefined | null | boolean) {
  switch (typeof item) {
    case 'boolean':
      return item
    case 'number':
      return item > 0 || item < 0
    case 'object':
      return !!item
    case 'string':
      item = item.toLowerCase()
      return ['true', '1'].indexOf(item) >= 0
    case 'undefined':
      return false

    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`toBool got unexpected value ${item}`)
  }
}
