import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export async function getPageContent(
  pageModelName: BuilderPageModelIdentifiers,
  pathname: string,
  countryCode: SupportedCountryCodes,
  language = SupportedLanguages.EN,
) {
  const locale = getLocaleForLanguage(language)

  const builderOptions = {
    query: {
      data: {
        countryCode: countryCode.toUpperCase(),
      },
    },
    userAttributes: {
      urlPath: pathname,
    },
    // Set prerender to false to return JSON instead of HTML
    prerender: false,
    // Set cachebust to true to get the latest content.
    // This should only be used to generate static pages.
    cachebust: true,
    locale,
  }

  const content = await pRetry(
    () => builderSDKClient.get(pageModelName, builderOptions).toPromise(),
    {
      retries: 2,
      minTimeout: 4000,
    },
  ).catch(error => {
    Sentry.captureException(error, {
      tags: {
        domain: 'builder.io',
        model: pageModelName,
        countryCode,
      },
      extra: {
        pathname,
      },
      level: 'error',
    })
    throw error
  })

  return content
}
