import * as Sentry from '@sentry/nextjs'
import { CountryCode, ParseError } from 'libphonenumber-js'
import { parsePhoneNumberWithError } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE: Record<
  SupportedCountryCodes,
  CountryCode
> = {
  [SupportedCountryCodes.US]: 'US',
  [SupportedCountryCodes.CA]: 'CA',
  [SupportedCountryCodes.GB]: 'GB',
  [SupportedCountryCodes.AU]: 'AU',
}

export const SUPPORTED_PHONE_NUMBER_COUNTRY_CODES: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: '+1',
  [SupportedCountryCodes.CA]: '+1',
  [SupportedCountryCodes.GB]: '+44',
  [SupportedCountryCodes.AU]: '+61',
}

// https://stackoverflow.com/a/43687969
export function normalizePhoneNumber(passed: string, countryCode?: SupportedCountryCodes) {
  const countryCodePrefix = countryCode && SUPPORTED_PHONE_NUMBER_COUNTRY_CODES[countryCode]
  const defaultCountryCodePrefix =
    SUPPORTED_PHONE_NUMBER_COUNTRY_CODES[DEFAULT_SUPPORTED_COUNTRY_CODE]

  // Split number and extension
  let [number, extension] = passed.split('x')

  number = number.replace(/[^\d+]+/g, '')
  extension = extension?.replace(/[^\d+]+/g, '')

  // Handle country code
  number = number.replace(/^00/, '+')

  if (
    number.startsWith(
      (countryCodePrefix ? countryCodePrefix : defaultCountryCodePrefix).replace('+', ''),
    )
  ) {
    number = '+' + number
  }

  if (!number.startsWith('+')) {
    if (countryCodePrefix) {
      number = countryCodePrefix + number
    } else {
      number = defaultCountryCodePrefix + number
      Sentry.captureMessage('Tried to normalize phone number without country code, using default', {
        tags: {
          domain: 'normalizePhoneNumber',
        },
        extra: {
          payload: passed,
          countryCode,
        },
      })
    }
  }

  // Add extension back if present
  return number + (extension ? `x${extension}` : '')
}

function parsePhoneNumber(phoneNumber: string, countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE) {
  const phoneLibCountryCode: CountryCode =
    SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode]
  try {
    // https://github.com/catamphetamine/libphonenumber-js/issues/468#issue-2504182999
    // We have to add phoneNumberMetadata from the 'libphonenumber-js/mobile/metadata'
    // in the function call below to make it work as explained in the issue above
    return parsePhoneNumberWithError(phoneNumber, phoneLibCountryCode, phoneNumberMetadata)
  } catch (e) {
    if (e instanceof ParseError) {
      Sentry.captureException(e, {
        tags: {
          domain: 'parsePhoneNumberWithError',
        },
        extra: {
          payload: phoneNumber,
        },
      })
    }
    throw e
  }
}

export function formatPhoneNumber(
  phoneNumber: string,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
) {
  if (!phoneNumber) return ''

  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode)

  if (!parsedPhoneNumber) throw new Error(`Failed to parse phone number ${phoneNumber}`)

  return parsedPhoneNumber.formatInternational()
}

export function validatePhoneNumber(
  phoneNumber: string,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
) {
  if (!phoneNumber) return false

  try {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode)
    if (!parsedPhoneNumber) return false

    return parsedPhoneNumber.isPossible() && parsedPhoneNumber.isValid()
  } catch (e) {
    if (e instanceof ParseError) {
      return false
    }
    throw e
  }
}
