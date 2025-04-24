import { parsePhoneNumberWithError } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/max/metadata'

import { getLogger } from '@/utils/shared/logger'
import { SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE } from '@/utils/shared/phoneNumber'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const logger = getLogger('isPhoneNumberCountrySupported')

export const getCountryCodeFromPhoneNumber = (
  phoneNumber: string,
  defaultCountryCode: SupportedCountryCodes = DEFAULT_SUPPORTED_COUNTRY_CODE,
) => {
  try {
    const parsedPhoneNumber = parsePhoneNumberWithError(
      phoneNumber,
      SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[defaultCountryCode],
      phoneNumberMetadata,
    )

    if (!parsedPhoneNumber?.country) {
      logger.error('No country found for phone number', {
        phoneNumber,
      })
      return
    }

    const maybeCountryCode = parsedPhoneNumber.country?.toLowerCase() as SupportedCountryCodes

    if (!ORDERED_SUPPORTED_COUNTRIES.includes(maybeCountryCode)) {
      logger.error('Phone number country not supported', {
        phoneNumber,
      })

      return
    }

    return maybeCountryCode
  } catch {
    logger.error('No country found for phone number', {
      phoneNumber,
    })
    return
  }
}
