import { isEUCountry } from '@/utils/shared/euCountryMapping'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getPetitionCountryCodeValidator(countryCode: SupportedCountryCodes) {
  const defaultValidatePetitionCountryCode = (targetCountryCode: string) =>
    targetCountryCode.toLowerCase() === countryCode.toLowerCase()

  const VALIDATOR_BY_COUNTRY_CODE = {
    [SupportedCountryCodes.US]: defaultValidatePetitionCountryCode,
    [SupportedCountryCodes.GB]: defaultValidatePetitionCountryCode,
    [SupportedCountryCodes.CA]: defaultValidatePetitionCountryCode,
    [SupportedCountryCodes.AU]: defaultValidatePetitionCountryCode,
    [SupportedCountryCodes.EU]: (targetCountryCode: string) =>
      isEUCountry(targetCountryCode.toLowerCase()),
  }

  return VALIDATOR_BY_COUNTRY_CODE[countryCode] || defaultValidatePetitionCountryCode
}
