import { describe, expect, it } from '@jest/globals'

import { PartialI18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import { createI18nMessages } from './createI18nMessages'

describe('createI18nMessages', () => {
  describe('with empty defaultMessages', () => {
    it('should return empty messages for all countries and languages', () => {
      const result = createI18nMessages({ defaultMessages: {} })

      expect(result).toEqual({
        [SupportedCountryCodes.US]: {
          [SupportedLanguages.EN]: {},
        },
        [SupportedCountryCodes.GB]: {
          [SupportedLanguages.EN]: {},
        },
        [SupportedCountryCodes.CA]: {
          [SupportedLanguages.EN]: {},
        },
        [SupportedCountryCodes.AU]: {
          [SupportedLanguages.EN]: {},
        },
        [SupportedCountryCodes.EU]: {
          [SupportedLanguages.FR]: {},
          [SupportedLanguages.DE]: {},
          [SupportedLanguages.EN]: {},
        },
      })
    })
  })

  describe('with defaultMessages only', () => {
    it('should apply default messages to all countries and languages', () => {
      const defaultMessages = {
        [SupportedLanguages.EN]: { hello: 'Hello', goodbye: 'Goodbye' },
        [SupportedLanguages.DE]: { hello: 'Hallo', goodbye: 'Auf Wiedersehen' },
        [SupportedLanguages.FR]: { hello: 'Bonjour', goodbye: 'Au revoir' },
      }

      const result = createI18nMessages({ defaultMessages })

      // Check US (EN only)
      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hello',
        goodbye: 'Goodbye',
      })

      // Check EU (all languages)
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hello',
        goodbye: 'Goodbye',
      })
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.DE]).toEqual({
        hello: 'Hallo',
        goodbye: 'Auf Wiedersehen',
      })
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]).toEqual({
        hello: 'Bonjour',
        goodbye: 'Au revoir',
      })
    })

    it('should handle partial default messages', () => {
      const defaultMessages = {
        [SupportedLanguages.EN]: { hello: 'Hello' },
        // Missing DE and FR
      }

      const result = createI18nMessages({ defaultMessages })

      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hello',
      })
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.DE]).toEqual({})
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]).toEqual({})
    })
  })

  describe('with overrides only', () => {
    it('should apply country-specific messages', () => {
      const result = createI18nMessages({
        defaultMessages: {},
        messagesOverrides: {
          [SupportedCountryCodes.US]: {
            [SupportedLanguages.EN]: { welcome: 'Welcome to USA' },
          },
          [SupportedCountryCodes.EU]: {
            [SupportedLanguages.EN]: { welcome: 'Welcome to Europe' },
            [SupportedLanguages.DE]: { welcome: 'Willkommen in Europa' },
            [SupportedLanguages.FR]: { welcome: 'Bienvenue en Europe' },
          },
        } as any,
      })

      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        welcome: 'Welcome to USA',
      })
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({
        welcome: 'Welcome to Europe',
      })
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.DE]).toEqual({
        welcome: 'Willkommen in Europa',
      })
    })

    it('should handle partial country messages', () => {
      const result = createI18nMessages({
        defaultMessages: {},
        messagesOverrides: {
          [SupportedCountryCodes.US]: {
            [SupportedLanguages.EN]: { welcome: 'Welcome to USA' },
          },
          // Missing other countries
        } as any,
      })

      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        welcome: 'Welcome to USA',
      })
      expect(result[SupportedCountryCodes.GB]?.[SupportedLanguages.EN]).toEqual({})
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({})
    })
  })

  describe('with both defaultMessages and overrides', () => {
    it('should merge messages with defaults, with overrides taking precedence', () => {
      const defaultMessages = {
        [SupportedLanguages.EN]: { hello: 'Hello', goodbye: 'Goodbye' },
        [SupportedLanguages.DE]: { hello: 'Hallo', goodbye: 'Auf Wiedersehen' },
      }

      const messagesOverrides: PartialI18nMessages = {
        [SupportedCountryCodes.US]: {
          [SupportedLanguages.EN]: { hello: 'Hi there!', welcome: 'Welcome!' },
        },
        [SupportedCountryCodes.EU]: {
          [SupportedLanguages.DE]: { hello: 'Guten Tag!' },
        },
      }

      const result = createI18nMessages({ defaultMessages, messagesOverrides })

      // US should override 'hello' but keep 'goodbye' from defaults, and add 'welcome'
      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hi there!',
        goodbye: 'Goodbye',
        welcome: 'Welcome!',
      })

      // EU DE should override 'hello' but keep 'goodbye' from defaults
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.DE]).toEqual({
        hello: 'Guten Tag!',
        goodbye: 'Auf Wiedersehen',
      })

      // EU EN should only have defaults (no specific messages)
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hello',
        goodbye: 'Goodbye',
      })
    })

    it('should handle empty objects gracefully', () => {
      const result = createI18nMessages({
        defaultMessages: {},
        messagesOverrides: {},
      })

      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({})
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({})
    })

    it('should allow partial language overrides within a country', () => {
      const defaultMessages = {
        [SupportedLanguages.EN]: { hello: 'Hello', goodbye: 'Goodbye' },
        [SupportedLanguages.DE]: { hello: 'Hallo', goodbye: 'Auf Wiedersehen' },
        [SupportedLanguages.FR]: { hello: 'Bonjour', goodbye: 'Au revoir' },
      }

      // Only override French for EU, leave English and German to use defaults
      const messagesOverrides: PartialI18nMessages = {
        [SupportedCountryCodes.EU]: {
          [SupportedLanguages.FR]: { hello: 'Salut!', welcome: 'Bienvenue!' },
          // Note: EN and DE are intentionally omitted to test partial overrides
        },
      }

      const result = createI18nMessages({ defaultMessages, messagesOverrides })

      // French should have overrides merged with defaults
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.FR]).toEqual({
        hello: 'Salut!', // overridden
        goodbye: 'Au revoir', // from defaults
        welcome: 'Bienvenue!', // added by override
      })

      // English should only have defaults (no overrides)
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.EN]).toEqual({
        hello: 'Hello',
        goodbye: 'Goodbye',
      })

      // German should only have defaults (no overrides)
      expect(result[SupportedCountryCodes.EU]?.[SupportedLanguages.DE]).toEqual({
        hello: 'Hallo',
        goodbye: 'Auf Wiedersehen',
      })
    })
  })

  describe('edge cases', () => {
    it('should handle missing country messages gracefully', () => {
      const result = createI18nMessages({
        defaultMessages: {},
        messagesOverrides: {
          [SupportedCountryCodes.US]: {
            [SupportedLanguages.EN]: { test: 'value' },
          },
        } as any,
      })

      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual({
        test: 'value',
      })
      expect(result[SupportedCountryCodes.GB]?.[SupportedLanguages.EN]).toEqual({})
    })

    it('should maintain structure for all supported countries', () => {
      const result = createI18nMessages({ defaultMessages: {} })

      // Verify all expected countries are present
      expect(result).toHaveProperty(SupportedCountryCodes.US)
      expect(result).toHaveProperty(SupportedCountryCodes.GB)
      expect(result).toHaveProperty(SupportedCountryCodes.CA)
      expect(result).toHaveProperty(SupportedCountryCodes.AU)
      expect(result).toHaveProperty(SupportedCountryCodes.EU)

      // Verify EU has all three languages
      expect(result[SupportedCountryCodes.EU]).toHaveProperty(SupportedLanguages.EN)
      expect(result[SupportedCountryCodes.EU]).toHaveProperty(SupportedLanguages.DE)
      expect(result[SupportedCountryCodes.EU]).toHaveProperty(SupportedLanguages.FR)

      // Verify other countries only have EN
      expect(Object.keys(result[SupportedCountryCodes.US] || {})).toEqual([SupportedLanguages.EN])
      expect(Object.keys(result[SupportedCountryCodes.GB] || {})).toEqual([SupportedLanguages.EN])
    })

    it('should preserve message object references when no merging occurs', () => {
      const messageObj = { test: 'value' }
      const defaultMessages = {
        [SupportedLanguages.EN]: messageObj,
      }

      const result = createI18nMessages({ defaultMessages })

      // Should create new objects due to spread operator
      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).not.toBe(messageObj)
      expect(result[SupportedCountryCodes.US]?.[SupportedLanguages.EN]).toEqual(messageObj)
    })
  })
})
