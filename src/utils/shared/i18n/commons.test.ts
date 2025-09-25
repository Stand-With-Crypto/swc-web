import { describe, expect, it } from '@jest/globals'

import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { i18nCommonMessages, withI18nCommons } from './commons'

describe('withCommons', () => {
  describe('with empty input messages', () => {
    it('should return only common messages', () => {
      const result = withI18nCommons({})

      expect(result).toEqual(i18nCommonMessages)
    })
  })

  describe('with input messages that do not overlap with commons', () => {
    it('should merge both common and input messages', () => {
      const inputMessages: I18nMessages = {
        [SupportedCountryCodes.US]: {
          [SupportedLanguages.EN]: {
            welcomeMessage: 'Welcome to the US',
          },
        },
        [SupportedCountryCodes.EU]: {
          [SupportedLanguages.EN]: {
            welcomeMessage: 'Welcome to Europe',
          },
          [SupportedLanguages.DE]: {
            welcomeMessage: 'Willkommen in Europa',
          },
          [SupportedLanguages.FR]: {
            welcomeMessage: 'Bienvenue en Europe',
          },
        },
      }

      const result = withI18nCommons(inputMessages)

      // Should have both common and input messages
      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        territoryDivision: 'State', // from commons
        welcomeMessage: 'Welcome to the US', // from input
      })

      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]).toEqual({
        territoryDivision: 'Pays', // from commons
        welcomeMessage: 'Bienvenue en Europe', // from input
      })
    })
  })

  describe('with input messages that override commons', () => {
    it('should prioritize input messages over common messages', () => {
      const inputMessages: I18nMessages = {
        [SupportedCountryCodes.US]: {
          [SupportedLanguages.EN]: {
            territoryDivision: 'Region', // Override the common 'State'
            customMessage: 'Custom message',
          },
        },
      }

      const result = withI18nCommons(inputMessages)

      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        territoryDivision: 'Region', // overridden by input
        customMessage: 'Custom message', // from input
      })
    })
  })
})
