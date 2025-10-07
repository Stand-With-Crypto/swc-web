import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { I18nMessages } from '@/utils/shared/i18n/types'

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
    },
    fr: {
      territoryDivision: 'État',
      US: 'États-Unis',
      CA: 'Canada',
      GB: 'Royaume-Uni',
      AU: 'Australie',
      EU: 'Union européenne',
    },
    de: {
      territoryDivision: 'Staat',
      US: 'Vereinigte Staaten',
      CA: 'Kanada',
      GB: 'Vereinigtes Königreich',
      AU: 'Australien',
      EU: 'Europäische Union',
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
