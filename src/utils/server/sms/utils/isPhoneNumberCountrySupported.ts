import { parsePhoneNumberWithError } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

import { SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE } from '@/utils/shared/phoneNumber'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const isPhoneNumberCountrySupported = (
  phoneNumber: string,
  countryCode: SupportedCountryCodes,
) => {
  try {
    const parsedPhoneNumber = parsePhoneNumberWithError(
      phoneNumber,
      SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode],
      phoneNumberMetadata,
    )

    if (!parsedPhoneNumber?.country) {
      return false
    }

    // libphonenumber-js returns the country code in uppercase
    return isSmsSupportedInCountry(parsedPhoneNumber.country?.toLowerCase())
  } catch {
    return false
  }
}
