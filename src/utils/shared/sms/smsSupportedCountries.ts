import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SMS_SUPPORTED_COUNTRIES: Record<SupportedCountryCodes, boolean> = {
  [SupportedCountryCodes.US]: true,
  [SupportedCountryCodes.GB]: false,
  [SupportedCountryCodes.CA]: false,
  [SupportedCountryCodes.AU]: false,
}

export const isSmsSupportedInCountry = (countryCode: SupportedCountryCodes | string) => {
  return SMS_SUPPORTED_COUNTRIES[countryCode as SupportedCountryCodes] ?? false
}
