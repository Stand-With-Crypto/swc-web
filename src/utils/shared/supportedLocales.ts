export enum SupportedLocale {
  EN_US = 'en-US',
}
export const DEFAULT_LOCALE = SupportedLocale.EN_US
export const ORDERED_SUPPORTED_LOCALES: readonly SupportedLocale[] = [SupportedLocale.EN_US]

export enum SupportedEULanguages {
  EN = 'en',
  DE = 'de',
  FR = 'fr',
}

export const ORDERED_SUPPORTED_EU_LANGUAGES: readonly SupportedEULanguages[] = [
  SupportedEULanguages.EN,
  SupportedEULanguages.DE,
  SupportedEULanguages.FR,
]
export const DEFAULT_EU_LANGUAGE = SupportedEULanguages.EN

export const EU_LANGUAGE_TO_LOCALE_MAP: Record<SupportedEULanguages, string> = {
  [SupportedEULanguages.EN]: 'en-US',
  [SupportedEULanguages.DE]: 'de-DE',
  [SupportedEULanguages.FR]: 'fr-FR',
}

export const SWC_PAGE_LANGUAGE_COOKIE_NAME = 'swc-page-language'
