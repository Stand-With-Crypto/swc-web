import { describe, expect, it } from '@jest/globals'

import { fakerFields } from '@/mocks/fakerUtils'
import { getCountryCodeFromPhoneNumber } from '@/utils/server/sms/utils/getCountryCodeFromPhoneNumber'
import {
  SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE,
  SUPPORTED_PHONE_NUMBER_COUNTRY_CODES,
} from '@/utils/shared/phoneNumber'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

describe('getCountryCodeFromPhoneNumber', () => {
  it.each(ORDERED_SUPPORTED_COUNTRIES)(
    'should return the country code for a valid phone number with country code prefix without passing the country code to the function',
    countryCode => {
      const phoneNumber = fakerFields.phoneNumber(
        SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode],
      )
      expect(getCountryCodeFromPhoneNumber(phoneNumber)).toBe(countryCode)
    },
  )

  it.each(ORDERED_SUPPORTED_COUNTRIES)(
    'should return the country code for a valid phone number without country code prefix passing the country code to the function',
    countryCode => {
      const phoneNumber = fakerFields
        .phoneNumber(SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode])
        .replace(SUPPORTED_PHONE_NUMBER_COUNTRY_CODES[countryCode], '')

      expect(getCountryCodeFromPhoneNumber(phoneNumber, countryCode)).toBe(countryCode)
    },
  )
})
