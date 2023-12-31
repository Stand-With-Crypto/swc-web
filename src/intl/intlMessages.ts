import 'server-only'
import { SupportedLocale } from '@/intl/locales'
import { createIntl } from '@formatjs/intl'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { MissingTranslationError } from 'react-intl'
import * as Sentry from '@sentry/nextjs'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('intlMessages')

// TODO figure out the translation workflow with a 3rd party provider
const mockGetIntlMessages = async (locale: SupportedLocale) => {
  // We never want to use any compiled translations in local development for english because we always want the latest changes to the defaultMessage to be displayed
  const enUSTranslations =
    NEXT_PUBLIC_ENVIRONMENT === 'local'
      ? {}
      : await import('@/intl/generated/compile/en-US.json').then(res => res.default)
  const options = {
    'en-US': enUSTranslations,
    es: {
      'sampleArchitecturePatterns.sampleTranslationClientComponent.translatedText':
        'Este texto del lado del servidor está traducido!',
      'sampleArchitecturePatterns.translatedText':
        'Este texto del lado del cliente está traducido!',
    },
  } satisfies Partial<Record<SupportedLocale, Record<string, string>>>
  return locale in options ? options[locale] : {}
}

export default async function getIntl(locale: SupportedLocale) {
  return createIntl({
    locale,
    messages: await mockGetIntlMessages(locale),
    onError: err => {
      // TODO determine when we want to enforce no missing translations
      if ('code' in err && err.code === 'MISSING_TRANSLATION') {
        return
      }
      Sentry.captureException(err, { tags: { domain: 'getIntl' } })
    },
    onWarn: warning => {
      logger.warn(warning)
    },
  })
}
