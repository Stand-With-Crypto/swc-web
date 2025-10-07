import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export interface ComponentMessages {
  [key: string]: string
}

export interface SupportedLanguagesByCountryCode {
  [SupportedCountryCodes.US]: [SupportedLanguages.EN]
  [SupportedCountryCodes.AU]: [SupportedLanguages.EN]
  [SupportedCountryCodes.CA]: [SupportedLanguages.EN]
  [SupportedCountryCodes.GB]: [SupportedLanguages.EN]
  [SupportedCountryCodes.EU]: [SupportedLanguages.FR, SupportedLanguages.DE, SupportedLanguages.EN]
}

// Legacy types - kept for backward compatibility
export type I18nCountryMessages<T extends SupportedCountryCodes> = {
  [K in SupportedLanguagesByCountryCode[T][number]]: ComponentMessages
}

export type I18nMessages<T extends Record<string, string> = ComponentMessages> = {
  [K in SupportedCountryCodes]?: LanguageMessages<T>
}

export type PartialI18nCountryMessages<T extends SupportedCountryCodes> = {
  [K in SupportedLanguagesByCountryCode[T][number]]?: ComponentMessages
}

export type PartialI18nMessages = {
  [K in SupportedCountryCodes]?: PartialI18nCountryMessages<K>
}

// New generic types with type-safe keys
export type LanguageMessages<T extends Record<string, string>> = {
  [K in SupportedLanguages]?: T
}

// Enforce that all objects in T have identical keys
export type UniformShape<T> = {
  [K in keyof T]: T[K] extends Record<string, string>
    ? T[keyof T] extends Record<string, string>
      ? keyof T[K] extends keyof T[keyof T]
        ? keyof T[keyof T] extends keyof T[K]
          ? T[K]
          : never
        : never
      : T[K]
    : T[K]
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
