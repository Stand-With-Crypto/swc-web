// https://stackoverflow.com/a/43687969
export function normalizePhoneNumber(passed: string) {
  // Split number and extension
  let [number, extension] = passed.split('x')

  number = number.replace(/[^\d+]+/g, '')
  extension = extension?.replace(/[^\d+]+/g, '')

  // Handle country code
  number = number.replace(/^00/, '+')
  if (number.match(/^1/)) number = '+' + number
  if (!number.match(/^\+/)) number = '+1' + number

  // Add extension back if present
  return number + (extension ? `x${extension}` : '')
}

export function formatPhoneNumber(phoneNumber: string) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)!
  if (match) {
    const intlCode = match[1] ? '+1 ' : ''
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return phoneNumber
}
