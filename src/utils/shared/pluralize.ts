export function pluralize({
  count,
  noun,
  suffix = 's',
}: {
  count: number
  noun: string
  suffix?: string
}) {
  return `${noun}${count !== 1 ? suffix : ''}`
}
