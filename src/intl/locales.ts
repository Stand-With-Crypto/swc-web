export enum SupportedLocale {
  EN_US = 'en-US',
  EN_UK = 'en-UK',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  SupportedLocale.EN_US,
  SupportedLocale.EN_UK,
]
