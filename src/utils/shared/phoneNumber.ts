import parsePhoneNumber, { CountryCode, isValidPhoneNumber } from 'libphonenumber-js'

const DEFAULT_COUNTRY_CODE: CountryCode = 'US'

export function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return ''

  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, DEFAULT_COUNTRY_CODE)

  if (!parsedPhoneNumber) throw new Error(`Failed to parse phone number ${phoneNumber}`)

  return parsedPhoneNumber.formatInternational()
}

export function validatePhoneNumber(phoneNumber: string) {
  return isValidPhoneNumber(phoneNumber, DEFAULT_COUNTRY_CODE)
}
