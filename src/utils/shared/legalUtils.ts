import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getSWCLegalEntityNameByCountryCode(countryCode: SupportedCountryCodes) {
  if (countryCode === SupportedCountryCodes.US) {
    return 'Stand With Crypto Alliance, Inc.'
  }

  return 'SWC International, Ltd.'
}

export const getPhysicalMailingAddressByCountryCode = (countryCode: SupportedCountryCodes) => {
  if (countryCode === SupportedCountryCodes.US) {
    return
  }

  return 'Suite 1, 7th Floor 50 Broadway, London, United Kingdom, SW1H 0DB'
}
