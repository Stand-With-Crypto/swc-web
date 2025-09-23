import { ComponentMessages, I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

//It's made that way to keep the extraction script working
const i18nMessages: I18nMessages = {
  us: {
    en: {
      territoryDivision: 'State',
    },
  },
  ca: {
    en: {
      territoryDivision: 'Province',
    },
  },
  au: {
    en: {
      territoryDivision: 'State',
    },
  },
  gb: {
    en: {
      territoryDivision: 'Country',
    },
  },
  eu: {
    en: {
      territoryDivision: 'Country',
    },
    fr: {
      territoryDivision: 'Pays',
    },
    de: {
      territoryDivision: 'Land',
    },
  },
}

export const i18nCommonMessages = i18nMessages

function mergeComponentMessages(
  commonMessages: ComponentMessages | undefined,
  inputMessages: ComponentMessages | undefined,
): ComponentMessages {
  return {
    ...commonMessages,
    ...inputMessages,
  }
}

function getLanguageMessages(
  countryMessages: Record<string, ComponentMessages> | undefined,
  languageCode: string,
): ComponentMessages | undefined {
  return countryMessages?.[languageCode]
}

export function withI18nCommons(messages: I18nMessages): I18nMessages {
  const result: I18nMessages = {}

  // Get all country codes from both common messages and input messages
  const allCountryCodes = new Set([...Object.keys(i18nCommonMessages), ...Object.keys(messages)])

  for (const countryCode of allCountryCodes) {
    const typedCountryCode = countryCode as SupportedCountryCodes
    const commonCountryMessages = i18nCommonMessages[typedCountryCode]
    const inputCountryMessages = messages[typedCountryCode]

    if (!commonCountryMessages && !inputCountryMessages) {
      continue
    }

    // Get all language codes from both common and input messages for this country
    const allLanguageCodes = new Set([
      ...(commonCountryMessages ? Object.keys(commonCountryMessages) : []),
      ...(inputCountryMessages ? Object.keys(inputCountryMessages) : []),
    ])

    const countryResult: Record<string, ComponentMessages> = {}

    for (const languageCode of allLanguageCodes) {
      const commonLanguageMessages = getLanguageMessages(commonCountryMessages, languageCode)
      const inputLanguageMessages = getLanguageMessages(inputCountryMessages, languageCode)

      // Deep merge the language messages - input messages override common messages
      countryResult[languageCode] = mergeComponentMessages(
        commonLanguageMessages,
        inputLanguageMessages,
      )
    }

    // Use Object.assign to avoid type assertion issues
    Object.assign(result, { [typedCountryCode]: countryResult })
  }

  return result
}
