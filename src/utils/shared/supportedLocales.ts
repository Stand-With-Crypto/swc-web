export enum SupportedLocale {
  EN_US = 'en-US',
  DE_DE = 'de-DE',
  FR_FR = 'fr-FR',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [SupportedLocale.EN_US]

export enum SupportedLanguages {
  EN = 'en',
  DE = 'de',
  FR = 'fr',
}

export const ORDERED_SUPPORTED_EU_LANGUAGES: readonly SupportedLanguages[] = [
  SupportedLanguages.EN,
  SupportedLanguages.DE,
  SupportedLanguages.FR,
]
export const DEFAULT_EU_LANGUAGE = SupportedLanguages.EN

export const LANGUAGE_TO_LOCALE_MAP: Record<SupportedLanguages, string> = {
  [SupportedLanguages.EN]: SupportedLocale.EN_US,
  [SupportedLanguages.DE]: SupportedLocale.DE_DE,
  [SupportedLanguages.FR]: SupportedLocale.FR_FR,
}

export const SWC_PAGE_LANGUAGE_COOKIE_NAME = 'swc-page-language'
