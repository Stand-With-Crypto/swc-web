import { SupportedLocale } from '@/utils/shared/supportedLocales'

export enum SupportedCountryCodes {
  US = 'us',
  BR = 'br',
}

export const DEFAULT_SUPPORTED_COUNTRY_CODE = SupportedCountryCodes.US
export const ORDERED_SUPPORTED_COUNTRIES: readonly SupportedCountryCodes[] = [
  SupportedCountryCodes.US,
  // TODO: uncomment this line when we complete the UK implementation
  // SupportedCountryCodes.GB,
]

export const COUNTRY_CODE_TO_LOCALE: Record<SupportedCountryCodes, SupportedLocale> = {
  [SupportedCountryCodes.US]: SupportedLocale.EN_US,
  [SupportedCountryCodes.BR]: SupportedLocale.PT_BR,
}

// Two lowercase letters (e.g., "us", "uk")
export const COUNTRY_CODE_REGEX_PATTERN = new RegExp(
  `^(${Object.values(SupportedCountryCodes).join('|')})$`,
)
