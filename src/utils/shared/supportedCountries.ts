import { SupportedLocale } from '@/utils/shared/supportedLocales'

export enum SupportedCountryCodes {
  US = 'us',
  GB = 'gb',
  CA = 'ca',
  AU = 'au',
}

export const DEFAULT_SUPPORTED_COUNTRY_CODE = SupportedCountryCodes.US
export const ORDERED_SUPPORTED_COUNTRIES: readonly SupportedCountryCodes[] = [
  SupportedCountryCodes.US,
  SupportedCountryCodes.GB,
  SupportedCountryCodes.CA,
  SupportedCountryCodes.AU,
]

export const COUNTRY_CODE_TO_LOCALE: Record<SupportedCountryCodes, SupportedLocale> = {
  [SupportedCountryCodes.US]: SupportedLocale.EN_US,
  [SupportedCountryCodes.GB]: SupportedLocale.EN_US,
  [SupportedCountryCodes.CA]: SupportedLocale.EN_US,
  [SupportedCountryCodes.AU]: SupportedLocale.EN_US,
}

export const SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME = 'SWC_CURRENT_PAGE_COUNTRY_CODE'

// Two lowercase letters (e.g., "us", "uk")
export const COUNTRY_CODE_REGEX_PATTERN = new RegExp(
  `^(${Object.values(SupportedCountryCodes).join('|')})$`,
)
