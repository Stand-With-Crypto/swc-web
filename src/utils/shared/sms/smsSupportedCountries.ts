import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SMS_SUPPORTED_COUNTRIES: Record<SupportedCountryCodes, boolean> = {
  [SupportedCountryCodes.US]: true,
  [SupportedCountryCodes.GB]: true,
  [SupportedCountryCodes.CA]: true,
  [SupportedCountryCodes.AU]: true,
}

export const isSmsSupportedInCountry = (countryCode: SupportedCountryCodes | string) => {
  return SMS_SUPPORTED_COUNTRIES[countryCode as SupportedCountryCodes] ?? false
}

const COUNTRY_REQUIRES_OPT_IN_CONFIRMATION: Record<SupportedCountryCodes, boolean> = {
  [SupportedCountryCodes.US]: false,
  [SupportedCountryCodes.GB]: true,
  [SupportedCountryCodes.CA]: true,
  [SupportedCountryCodes.AU]: true,
}

export const requiresOptInConfirmation = (countryCode: SupportedCountryCodes | string) => {
  return COUNTRY_REQUIRES_OPT_IN_CONFIRMATION[countryCode as SupportedCountryCodes] ?? false
}
