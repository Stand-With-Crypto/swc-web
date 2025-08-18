export enum SupportedLocale {
  EN_US = 'en-US',
  FR_CA = 'fr-CA',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  SupportedLocale.EN_US,
  SupportedLocale.FR_CA,
]
