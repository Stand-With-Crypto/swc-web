import { SupportedLocale } from '@/utils/shared/supportedLocales'

export enum SupportedCountryCodes {
  US = 'us',
}

export const DEFAULT_SUPPORTED_COUNTRY_CODE = SupportedCountryCodes.US
export const ORDERED_SUPPORTED_COUNTRIES: readonly SupportedCountryCodes[] = [
  SupportedCountryCodes.US,
]

export const COUNTRY_CODE_TO_LOCALE: Record<SupportedCountryCodes, SupportedLocale> = {
  [SupportedCountryCodes.US]: SupportedLocale.EN_US,
}

export const SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME = 'SWC_CURRENT_PAGE_COUNTRY_CODE'
