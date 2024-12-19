import 'server-only'

import { createIntl } from '@formatjs/intl'
import * as Sentry from '@sentry/nextjs'

import { SupportedLocale } from '@/intl/locales'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger('intlMessages')

// LATER-TASK figure out the translation workflow with a 3rd party provider
const mockGetIntlMessages = async (locale: SupportedLocale) => {
  // We never want to use any compiled translations in local development for english because we always want the latest changes to the defaultMessage to be displayed
  const enUSTranslations =
    NEXT_PUBLIC_ENVIRONMENT === 'local'
      ? {}
      : await import('@/intl/generated/compile/en-US.json').then(res => res.default)
  const options = {
    'en-US': enUSTranslations,
    'en-UK': {},
  } satisfies Partial<Record<SupportedLocale, Record<string, string>>>
  return locale in options ? options[locale] : {}
}

export default async function getIntl(locale: SupportedLocale) {
  return createIntl({
    locale,
    messages: await mockGetIntlMessages(locale),
    onError: err => {
      // LATER-TASK determine when we want to enforce no missing translations
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
