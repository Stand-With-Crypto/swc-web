import { mergeI18nMessages } from './mergeI18nMessages'
import { I18nMessages } from './types'

import { describe, expect, it } from '@jest/globals'

describe('mergeI18nMessages', () => {
  describe('edge cases', () => {
    it('should return empty object when both inputs are undefined', () => {
      const result = mergeI18nMessages(undefined, undefined)
      expect(result).toEqual({})
    })

    it('should return copy of target when source is undefined', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const result = mergeI18nMessages(target, undefined)
      expect(result).toEqual(target)
      expect(result).not.toBe(target) // Should be a copy
    })

    it('should return copy of source when target is undefined', () => {
      const source: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const result = mergeI18nMessages(undefined, source)
      expect(result).toEqual(source)
      expect(result).not.toBe(source) // Should be a copy
    })
  })

  describe('basic merging', () => {
    it('should merge messages for same country and language', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello', goodbye: 'Goodbye' } },
      }
      const source: I18nMessages = {
        us: { en: { hello: 'Hi there!', welcome: 'Welcome' } },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        us: {
          en: {
            hello: 'Hi there!', // Source wins
            goodbye: 'Goodbye', // From target
            welcome: 'Welcome', // From source
          },
        },
      })
    })

    it('should add new countries from source', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const source: I18nMessages = {
        ca: { en: { hello: 'Hello Canada' } },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        us: { en: { hello: 'Hello' } },
        ca: { en: { hello: 'Hello Canada' } },
      })
    })

    it('should add new languages for existing countries', () => {
      const target: I18nMessages = {
        // @ts-expect-error - This is a test
        eu: { en: { hello: 'Hello' } },
      }
      const source: I18nMessages = {
        // @ts-expect-error - This is a test
        eu: { fr: { hello: 'Bonjour' }, de: { hello: 'Hallo' } },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        eu: {
          en: { hello: 'Hello' },
          fr: { hello: 'Bonjour' },
          de: { hello: 'Hallo' },
        },
      })
    })
  })

  describe('complex merging scenarios', () => {
    it('should handle complex nested structure with multiple countries and languages', () => {
      const target: I18nMessages = {
        us: {
          en: {
            hello: 'Hello',
            goodbye: 'Goodbye',
            notFound: 'Not found',
          },
        },
        eu: {
          en: { hello: 'Hello EU' },
          fr: { hello: 'Bonjour', goodbye: 'Au revoir' },
          de: { hello: 'Hallo' },
        },
      }

      const source: I18nMessages = {
        us: {
          en: {
            hello: 'Hi there!',
            welcome: 'Welcome',
            timeout: 'Request timeout',
          },
        },
        ca: {
          en: { hello: 'Hello Canada' },
        },
        eu: {
          en: { hello: 'Hello EU' },
          de: { hello: 'Hallo' },
          fr: { hello: 'Salut' }, // Override existing
        },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        us: {
          en: {
            hello: 'Hi there!', // Source wins
            goodbye: 'Goodbye', // From target
            welcome: 'Welcome', // From source
            notFound: 'Not found', // From target
            timeout: 'Request timeout', // From source
          },
        },
        ca: {
          en: { hello: 'Hello Canada' }, // From source
        },
        eu: {
          en: { hello: 'Hello EU' }, // From target
          fr: {
            hello: 'Salut', // Source wins
            goodbye: 'Au revoir', // From target
          },
          de: { hello: 'Hallo' }, // From source
        },
      })
    })

    it('should handle arrays by replacing them entirely', () => {
      const target: I18nMessages = {
        us: {
          en: {
            items: ['item1', 'item2'] as any,
            hello: 'Hello',
          },
        },
      }

      const source: I18nMessages = {
        us: {
          en: {
            items: ['newItem1', 'newItem2', 'newItem3'] as any,
          },
        },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        us: {
          en: {
            items: ['newItem1', 'newItem2', 'newItem3'], // Completely replaced
            hello: 'Hello', // Preserved from target
          },
        },
      })
    })

    it('should preserve null and undefined values correctly', () => {
      const target: I18nMessages = {
        us: {
          en: {
            hello: 'Hello',
            nullValue: null as any,
            undefinedValue: undefined as any,
          },
        },
      }

      const source: I18nMessages = {
        us: {
          en: {
            nullValue: 'Not null anymore' as any,
            newValue: 'New',
          },
        },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).toEqual({
        us: {
          en: {
            hello: 'Hello',
            nullValue: 'Not null anymore', // Source wins
            undefinedValue: undefined,
            newValue: 'New',
          },
        },
      })
    })
  })

  describe('immutability', () => {
    it('should not modify the original target object', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const source: I18nMessages = {
        us: { en: { hello: 'Hi there!' } },
      }

      const originalTarget = JSON.stringify(target)
      mergeI18nMessages(target, source)

      expect(JSON.stringify(target)).toBe(originalTarget)
    })

    it('should not modify the original source object', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const source: I18nMessages = {
        us: { en: { hello: 'Hi there!' } },
      }

      const originalSource = JSON.stringify(source)
      mergeI18nMessages(target, source)

      expect(JSON.stringify(source)).toBe(originalSource)
    })

    it('should return a new object reference', () => {
      const target: I18nMessages = {
        us: { en: { hello: 'Hello' } },
      }
      const source: I18nMessages = {
        ca: { en: { hello: 'Hello Canada' } },
      }

      const result = mergeI18nMessages(target, source)

      expect(result).not.toBe(target)
      expect(result).not.toBe(source)
    })
  })
})
