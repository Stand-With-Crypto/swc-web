// https://stackoverflow.com/a/43687969
export function normalizePhoneNumber(passed: string) {
  let number = passed
  number = number.replace(/[^\d+]+/g, '')
  number = number.replace(/^00/, '+')
  if (number.match(/^1/)) number = '+' + number
  if (!number.match(/^\+/)) number = '+1' + number
  return number
}
