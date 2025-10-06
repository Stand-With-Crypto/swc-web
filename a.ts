import { getSupportedLanguagesForCountry } from '@/utils/shared/i18n/getSupportedLanguagesByCountry'
import { SupportedLanguagesByCountryCode } from '@/utils/shared/i18n/types'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

type LanguageMessages<T extends Record<string, string>> = {
  [K in SupportedLanguages]?: T
}

type I18nMessages<T extends Record<string, string>> = {
  [K in SupportedCountryCodes]?: LanguageMessages<T>
}

// Enforce that all objects in T have identical keys
type UniformShape<T> = {
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

function createX<
  const TDefaultMessages extends Partial<Record<SupportedLanguages, Record<string, string>>>,
  T extends Record<string, string> = NonNullable<TDefaultMessages[keyof TDefaultMessages]>,
>({
  defaultMessages,
  overrides,
}: {
  defaultMessages: TDefaultMessages & UniformShape<TDefaultMessages>
  overrides?: Partial<{
    [Country in SupportedCountryCodes]?: Partial<{
      [Lang in SupportedLanguagesByCountryCode[Country][number]]?: T extends infer U
        ? Partial<Record<keyof U, string>>
        : unknown
    }>
  }>
}): I18nMessages<T> {
  const x: I18nMessages<T> = {}

  for (const countryCode of ORDERED_SUPPORTED_COUNTRIES) {
    const supportedLanguages = getSupportedLanguagesForCountry(countryCode)
    const countryMessagesOverrides = overrides?.[countryCode]
    const countryMessages: Record<string, Record<string, string>> = {}

    for (const language of supportedLanguages) {
      const languageMessagesOverrides =
        countryMessagesOverrides?.[language as keyof typeof countryMessagesOverrides]

      const baseMessages = defaultMessages[language] ?? {}
      const overrideMessages = languageMessagesOverrides ?? {}

      countryMessages[language] = {
        ...baseMessages,
        ...overrideMessages,
      }
    }

    x[countryCode] = countryMessages
  }

  return x
}

const x = createX({
  defaultMessages: {
    en: {
      welcome: 'Welcome',
      test: 'uuuuu',
    },
    de: {
      welcome: 'Willkommen',
      test: 'Test',
    },
    fr: {
      welcome: 'Bienvenue',
      test: 'Test',
      invalid: 'Invalid',
    },
  },
  overrides: {
    eu: {
      en: {
        wrong: 'ANOTHER TRANSLATION',
      },
    },
  },
})

function getX<T extends Record<string, string>>({
  messages,
  language,
  countryCode,
}: {
  messages: I18nMessages<T>
  language: SupportedLanguages
  countryCode: SupportedCountryCodes
}) {
  return {
    t: (key: keyof T) => {
      return messages[countryCode]?.[language]?.[key] ?? key
    },
  }
}

function getX2<T extends Record<string, string>>({ messages }: { messages: I18nMessages<T> }) {
  const randomCountryCode =
    ORDERED_SUPPORTED_COUNTRIES[Math.floor(Math.random() * ORDERED_SUPPORTED_COUNTRIES.length)]
  const randomLanguage =
    getSupportedLanguagesForCountry(randomCountryCode)[
      Math.floor(Math.random() * getSupportedLanguagesForCountry(randomCountryCode).length)
    ]

  return {
    t: (key: keyof T) => {
      return messages[randomCountryCode]?.[randomLanguage]?.[key] ?? key
    },
  }
}

const { t } = getX({
  messages: x,
  language: SupportedLanguages.EN,
  countryCode: SupportedCountryCodes.US,
})

// TypeScript now enforces valid keys
t('welcome') // ✅ OK
t('test') // ✅ OK
t('wrong') // ❌ TypeScript error: not assignable to '"welcome" | "test"'

const { t: t2 } = getX2({ messages: x })

// TypeScript now enforces valid keys
t2('welcome') // ✅ OK
t2('test') // ✅ OK
t2('wrong') // ❌ TypeScript error: not assignable to '"welcome" | "test"'
