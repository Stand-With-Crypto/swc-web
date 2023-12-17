export enum SupportedLocale {
  EN_US = 'en-US',
  ES = 'es',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  SupportedLocale.EN_US,
  SupportedLocale.ES,
]
