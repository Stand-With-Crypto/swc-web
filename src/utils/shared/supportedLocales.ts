export enum SupportedLocale {
  EN_US = 'en-US',
  PT_BR = 'pt-BR',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  SupportedLocale.EN_US,
  SupportedLocale.PT_BR,
]
