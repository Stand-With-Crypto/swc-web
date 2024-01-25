export function pluralize({
  count,
  singular,
  plural,
}: {
  count: number
  singular: string
  plural?: string
}) {
  if (count === 1) {
    return singular
  }
  if (plural) {
    return plural
  }
  return `${singular}s`
}
