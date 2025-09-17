import * as Sentry from '@sentry/nextjs'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_LOCALE } from '@/utils/shared/supportedLocales'

interface GetPagePathsInput {
  pageModelName: BuilderPageModelIdentifiers
  countryCode?: SupportedCountryCodes
}

/** Retrieves a list of all existing routes under a specific page model  */
export async function getPagePaths({
  pageModelName,
  countryCode,
}: GetPagePathsInput): Promise<string[]> {
  return builderSDKClient
    .getAll(pageModelName, {
      query: {
        data: {
          countryCode: countryCode?.toUpperCase(),
        },
      },
      options: {
        noTargeting: true,
      },
      sort: {
        createdDate: -1,
      },
      locale: DEFAULT_LOCALE,
      fields: 'data,createdDate',
      cachebust: true,
    })
    .then(res => res?.map(({ data }) => data?.url) ?? [])
    .catch(error => {
      Sentry.captureException(error, {
        tags: {
          domain: 'builder.io',
          model: pageModelName,
          countryCode,
        },
        level: 'error',
      })
      throw error
    })
}
