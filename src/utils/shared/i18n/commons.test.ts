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
      const usEnResult = result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]
      expect(usEnResult).toBeDefined()
      expect(usEnResult?.territoryDivision).toBeDefined() // from commons
      expect(usEnResult?.welcomeMessage).toBe('Welcome to the US') // from input

      const euFrResult = result[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]
      expect(euFrResult).toBeDefined()
      expect(euFrResult?.territoryDivision).toBeDefined() // from commons
      expect(euFrResult?.welcomeMessage).toBe('Bienvenue en Europe') // from input

      // Verify that common messages are preserved from the original commons
      const commonMessages = i18nCommonMessages[SupportedCountryCodes.US]?.[SupportedLanguages.EN]
      expect(usEnResult?.territoryDivision).toBe(commonMessages?.territoryDivision)

      const commonEuFrMessages =
        i18nCommonMessages[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]
      expect(euFrResult?.territoryDivision).toBe(commonEuFrMessages?.territoryDivision)
    })
  })

  describe('with input messages that override commons', () => {
    it('should prioritize input messages over common messages', () => {
      const inputMessages: I18nMessages = {
        [SupportedCountryCodes.US]: {
          [SupportedLanguages.EN]: {
            territoryDivision: 'Region', // Override the common value
            customMessage: 'Custom message',
          },
        },
      }

      const result = withI18nCommons(inputMessages)

      const usEnResult = result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]
      expect(usEnResult).toBeDefined()

      // Verify that input message overrides common message
      expect(usEnResult?.territoryDivision).toBe('Region') // overridden by input
      expect(usEnResult?.customMessage).toBe('Custom message') // from input

      // Verify that the override actually happened by checking it differs from commons
      const commonMessages = i18nCommonMessages[SupportedCountryCodes.US]?.[SupportedLanguages.EN]
      expect(usEnResult?.territoryDivision).not.toBe(commonMessages?.territoryDivision)
    })
  })
})
