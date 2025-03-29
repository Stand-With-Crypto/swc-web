import { parsePhoneNumberWithError } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const supportedCountries: SupportedCountryCodes[] = [SupportedCountryCodes.US]

export const isPhoneNumberCountrySupported = (phoneNumber: string) => {
  try {
    const parsedPhoneNumber = parsePhoneNumberWithError(phoneNumber, 'US', phoneNumberMetadata)

    if (!parsedPhoneNumber?.country) {
      return false
    }

    // libphonenumber-js returns the country code in uppercase
    return supportedCountries.includes(parsedPhoneNumber.country?.toLowerCase())
  } catch {
    return false
  }
}
