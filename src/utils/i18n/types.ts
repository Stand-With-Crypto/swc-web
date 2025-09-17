// Define our own types since FormatJS doesn't export these directly from the main package
export type PrimitiveType = string | number | boolean | null | undefined | Date

// Simple MessageFormatElement type for our use case
export interface MessageFormatElement {
  type: string
  value?: string | number
  [key: string]: any
}

export type SupportedLanguage = 'en' | 'de' | 'fr'

// FormatJS-compatible types
export interface MessageDescriptor {
  id: string
  defaultMessage?: string
  description?: string
}

// MessageValues type that's compatible with FormatJS - keep it simple for now
export type MessageValues = Record<string, PrimitiveType>

// FormatJS XML element function type (for future rich text support)
export type FormatXMLElementFn<T = React.ReactNode, R = React.ReactElement> = (chunks: T[]) => R

// Message is a string in ICU format (we don't use pre-compiled arrays in our implementation)
export type TranslationMessage = string

export interface ComponentMessages {
  [key: string]: TranslationMessage
}

export type I18nMessages = {
  [K in SupportedLanguage]: ComponentMessages
}

// Legacy type for backward compatibility
export interface LanguageMessages {
  [componentKey: string]: ComponentMessages
}

// Legacy types for backward compatibility during migration
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
