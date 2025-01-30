import { SupportedLocale } from '@/utils/shared/supportedLocales'

export enum SupportedCountryCodes {
  US = 'US',
}

export const DEFAULT_SUPPORTED_COUNTRY_CODE = SupportedCountryCodes.US
export const ORDERED_SUPPORTED_COUNTRIES: readonly SupportedCountryCodes[] = [
  SupportedCountryCodes.US,
]

export const COUNTRY_CODE_TO_LOCALE: Record<SupportedCountryCodes, SupportedLocale> = {
  [SupportedCountryCodes.US]: SupportedLocale.EN_US,
}
