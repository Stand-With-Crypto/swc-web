import { mergeWith } from 'lodash-es'

import { I18nMessages } from './types'

/**
 * Deep merges two I18nMessages objects, with the source object taking precedence over the target.
 *
 * This function performs a recursive deep merge of two I18nMessages objects using lodash-es,
 * making it ideal for merging i18n message structures where you want to combine default
 * messages with country/language-specific overrides while preserving the nested structure.
 *
 * @param target - The base I18nMessages object to merge into (lower precedence). Can be undefined.
 * @param source - The I18nMessages object to merge from (higher precedence). Can be undefined.
 *
 * @returns A new merged I18nMessages object. The source object's values will override
 *          the target object's values when there are conflicts.
 *
 * @example
 * ```typescript
 * const targetMessages: I18nMessages = {
 *   us: { en: { hello: 'Hello', goodbye: 'Goodbye' } },
 *   eu: { en: { hello: 'Hello' }, fr: { hello: 'Bonjour' } }
 * };
 *
 * const sourceMessages: I18nMessages = {
 *   us: { en: { hello: 'Hi there!', welcome: 'Welcome' } }, // Different shape
 *   ca: { en: { hello: 'Hello Canada' } }, // New country
 *   eu: { de: { hello: 'Hallo' } } // New language for existing country
 * };
 *
 * export const i18nMessages = mergeI18nMessages(targetMessages, sourceMessages);
 * // Result: {
 * //   us: { en: { hello: 'Hi there!', goodbye: 'Goodbye', welcome: 'Welcome' } },
 * //   eu: { en: { hello: 'Hello' }, fr: { hello: 'Bonjour' }, de: { hello: 'Hallo' } },
 * //   ca: { en: { hello: 'Hello Canada' } }
 * // }
 * ```
 *
 * @remarks
 * - If both parameters are undefined, returns an empty I18nMessages object
 * - If only one parameter is defined, returns a shallow copy of that object
 * - Countries and languages don't need to match between objects - unique ones will be included
 * - For nested message objects, recursively merges properties using lodash mergeWith
 * - Arrays are treated as primitive values and are replaced entirely (not merged)
 * - Source values always win in case of conflicts at any nesting level
 * - Maintains type safety with I18nMessages structure (country -> language -> messages)
 */
export function mergeI18nMessages(
  target: I18nMessages | undefined,
  source: I18nMessages | undefined,
): I18nMessages {
  if (!target && !source) {
    return {}
  }
  if (!target) {
    return { ...source }
  }
  if (!source) {
    return { ...target }
  }

  return mergeWith({}, target, source, (objValue, srcValue) => {
    // If source value is an array, replace the target array entirely
    if (Array.isArray(srcValue)) {
      return srcValue
    }
    // Let lodash handle the default merging behavior for objects and primitives
    return undefined
  })
}
