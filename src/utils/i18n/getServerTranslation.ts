import { getServerLanguage } from '@/utils/i18n/language-utils'

import { createTranslator } from './createTranslator'
import type { I18nMessages } from './types'

/**
 * Function to use translations in server components and server-side functions
 *
 * @param i18nMessages - Object with the component translations
 * @param contextName - Component name (optional)
 * @returns Object translator with t() method to translate
 *
 * @example
 * ```tsx
 * const i18nMessages = {
 *   en: { 'title': 'Server Component Title' },
 *   de: { 'title': 'Server-Komponente Titel' },
 *   fr: { 'title': 'Titre du Composant Serveur' }
 * }
 *
 * export default function ServerComponent() {
 *   const { t } = getTranslation(i18nMessages)
 *
 *   return <h1>{t('title')}</h1>
 * }
 * ```
 */
export async function getServerTranslation(
  i18nMessages: I18nMessages,
  contextName: string = 'unknown',
) {
  const language = await getServerLanguage()
  const translator = createTranslator(i18nMessages, language, contextName)

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    contextName: translator.getContextName(),
  }
}
