import * as Sentry from '@sentry/nextjs'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getPageContent(
  pageModelName: BuilderPageModelIdentifiers,
  pathname: string,
  countryCode: SupportedCountryCodes,
) {
  return builderSDKClient
    .get(pageModelName, {
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
    })
    .toPromise()
    .catch(error => {
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
}
