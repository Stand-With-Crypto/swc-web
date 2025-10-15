import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

//It's made that way to keep the extraction script working
const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      territoryDivision: 'State',
      US: 'United States',
      CA: 'Canada',
      GB: 'United Kingdom',
      AU: 'Australia',
      EU: 'European Union',
      USDemonym: 'American',
      AUDemonym: 'Australian',
      GBDemonym: 'British',
      CADemonym: 'Canadian',
      EUDemonym: 'European',
      USWithPrefix: 'the United States',
      CAWithPrefix: 'Canada',
      GBWithPrefix: 'the United Kingdom',
      AUWithPrefix: 'Australia',
      EUWithPrefix: 'the European Union',
    },
    fr: {
      territoryDivision: 'État',
      US: 'États-Unis',
      CA: 'Canada',
      GB: 'Royaume-Uni',
      AU: 'Australie',
      EU: 'Union européenne',
      USDemonym: 'Américain',
      AUDemonym: 'Australien',
      GBDemonym: 'Brit',
      CADemonym: 'Canadien',
      EUDemonym: 'Europeen',
      USWithPrefix: 'les États-Unis',
      CAWithPrefix: 'Canada',
      GBWithPrefix: 'le Royaume-Uni',
      AUWithPrefix: 'Australie',
      EUWithPrefix: "l'Union européenne",
    },
    de: {
      territoryDivision: 'Staat',
      US: 'Vereinigte Staaten',
      CA: 'Kanada',
      GB: 'Vereinigtes Königreich',
      AU: 'Australien',
      EU: 'Europäische Union',
      USDemonym: 'Amerikanisch',
      AUDemonym: 'Australisch',
      GBDemonym: 'Britisch',
      CADemonym: 'Kanadisch',
      EUDemonym: 'Europäer',
      USWithPrefix: 'die Vereinigten Staaten',
      CAWithPrefix: 'Kanada',
      GBWithPrefix: 'das Vereinigte Königreich',
      AUWithPrefix: 'Australien',
      EUWithPrefix: 'die Europäische Union',
    },
  },
  messagesOverrides: {
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
  },
})

export const i18nCommonMessages = i18nMessages

export function withI18nCommons<T extends Record<string, string>>(messages: I18nMessages<T>) {
  return mergeI18nMessages(i18nCommonMessages, messages)
}

export const COUNTRY_CODE_TO_DEMONYM_KEY = {
  [SupportedCountryCodes.US]: 'USDemonym',
  [SupportedCountryCodes.GB]: 'GBDemonym',
  [SupportedCountryCodes.CA]: 'CADemonym',
  [SupportedCountryCodes.AU]: 'AUDemonym',
  [SupportedCountryCodes.EU]: 'EUDemonym',
} as const

export const COUNTRY_CODE_TO_DISPLAY_NAME_KEY = {
  [SupportedCountryCodes.US]: 'US',
  [SupportedCountryCodes.GB]: 'GB',
  [SupportedCountryCodes.CA]: 'CA',
  [SupportedCountryCodes.AU]: 'AU',
  [SupportedCountryCodes.EU]: 'EU',
} as const

export const COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX_KEY = {
  [SupportedCountryCodes.US]: 'USWithPrefix',
  [SupportedCountryCodes.GB]: 'GBWithPrefix',
  [SupportedCountryCodes.CA]: 'CAWithPrefix',
  [SupportedCountryCodes.AU]: 'AUWithPrefix',
  [SupportedCountryCodes.EU]: 'EUWithPrefix',
} as const
