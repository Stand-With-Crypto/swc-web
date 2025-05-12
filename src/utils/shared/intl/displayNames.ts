import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const _countryCodeToDisplayName = {
  [SupportedCountryCodes.US]: 'United States',
  [SupportedCountryCodes.CA]: 'Canada',
  [SupportedCountryCodes.GB]: 'United Kingdom',
  [SupportedCountryCodes.AU]: 'Australia',
} as const
export type CountryDisplayName =
  (typeof _countryCodeToDisplayName)[keyof typeof _countryCodeToDisplayName]
export const COUNTRY_CODE_TO_DISPLAY_NAME = _countryCodeToDisplayName

/**
 * Compile-time check to ensure all SupportedCountryCodes keys are present
 */
const _displayNamesTypeCheck: Record<SupportedCountryCodes, CountryDisplayName> =
  _countryCodeToDisplayName

export const COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: `the ${COUNTRY_CODE_TO_DISPLAY_NAME[SupportedCountryCodes.US]}`,
  [SupportedCountryCodes.CA]: COUNTRY_CODE_TO_DISPLAY_NAME[SupportedCountryCodes.CA],
  [SupportedCountryCodes.GB]: `the ${COUNTRY_CODE_TO_DISPLAY_NAME[SupportedCountryCodes.GB]}`,
  [SupportedCountryCodes.AU]: COUNTRY_CODE_TO_DISPLAY_NAME[SupportedCountryCodes.AU],
}

export const COUNTRY_CODE_TO_DEMONYM: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: 'American',
  [SupportedCountryCodes.GB]: 'British',
  [SupportedCountryCodes.CA]: 'Canadian',
  [SupportedCountryCodes.AU]: 'Australian',
}
