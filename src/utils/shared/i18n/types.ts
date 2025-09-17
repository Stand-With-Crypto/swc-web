import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

export interface ComponentMessages {
  [key: string]: string
}

export interface LanguageMessages {
  [componentKey: string]: ComponentMessages
}

export type I18nMessages = {
  [K in SupportedEULanguages]: ComponentMessages
}

// Define our own types since FormatJS doesn't export these directly from the main package
export type IntlPrimitiveType = string | number | boolean | null | undefined | Date

export type MessageValues = Record<string, IntlPrimitiveType>
export interface InterpolationValues {
  [key: string]: string | number | boolean
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
