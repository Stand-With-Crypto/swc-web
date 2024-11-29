import { CountryCode } from 'libphonenumber-js'
import { parsePhoneNumberWithError } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

const DEFAULT_COUNTRY_CODE: CountryCode = 'US'

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
  if (!phoneNumber) return ''

  // https://github.com/catamphetamine/libphonenumber-js/issues/468#issue-2504182999
  const parsedPhoneNumber = parsePhoneNumberWithError(
    phoneNumber,
    DEFAULT_COUNTRY_CODE,
    phoneNumberMetadata,
  )

  if (!parsedPhoneNumber) throw new Error(`Failed to parse phone number ${phoneNumber}`)

  return parsedPhoneNumber.formatInternational()
}

export function validatePhoneNumber(phoneNumber: string) {
  // https://github.com/catamphetamine/libphonenumber-js/issues/468#issue-2504182999
  const parsedPhoneNumber = parsePhoneNumberWithError(
    phoneNumber,
    DEFAULT_COUNTRY_CODE,
    phoneNumberMetadata,
  )

  if (!parsedPhoneNumber) return false

  return parsedPhoneNumber.isPossible() && parsedPhoneNumber.isValid()
}
