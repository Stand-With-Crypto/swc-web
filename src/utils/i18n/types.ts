export type SupportedLanguage = 'en' | 'de' | 'fr'

export interface InterpolationValues {
  [key: string]: string | number | boolean
}

export interface PluralOptions {
  zero?: string
  one?: string
  other: string
}

export interface ConditionalOptions {
  [condition: string]: string
}

export type TranslationValue = string | PluralOptions | ConditionalOptions

export interface ComponentMessages {
  [key: string]: TranslationValue
}

export interface LanguageMessages {
  [componentKey: string]: ComponentMessages
}

export type I18nMessages = {
  [K in SupportedLanguage]: ComponentMessages
}

export interface PluralContext {
  count: number
  [key: string]: any
}

export interface ConditionalContext {
  condition: string
  [key: string]: any
}

export type InterpolationContext =
  | InterpolationValues
  | (InterpolationValues & PluralContext)
  | (InterpolationValues & ConditionalContext)
