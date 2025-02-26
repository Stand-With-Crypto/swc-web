import * as Sentry from '@sentry/nextjs'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import {
  BuilderPageModelIdentifiers,
  InternationalBuilderPageModel,
} from '@/utils/server/builder/models/page/constants'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export interface PageMetadata {
  title: string
  description?: string
  hasFooter: boolean
  hasNavbar: boolean
}

export async function getPageDetails(
  pageModelName: BuilderPageModelIdentifiers,
  pathname: string,
  countryCode: SupportedCountryCodes,
): Promise<PageMetadata> {
  let urlPath = pathname
  let pageModel: BuilderPageModelIdentifiers | InternationalBuilderPageModel = pageModelName

  if (
    pageModelName === BuilderPageModelIdentifiers.PAGE &&
    countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE
  ) {
    // TODO: remove this once we add more SupportedCountryCodes
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    urlPath = `/${countryCode}${pathname}`
    pageModel = ('page-' + countryCode) as InternationalBuilderPageModel
  }

  const content = await builderSDKClient
    .get(pageModel, {
      userAttributes: {
        urlPath,
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
      fields: 'data',
    })
    .toPromise()

  if (!content?.data) {
    Sentry.captureMessage(`Page content not found for model ${pageModel}`, {
      extra: {
        pathname: urlPath,
        content,
      },
      tags: {
        domain: 'builder.io',
        model: pageModel,
      },
    })
    return {
      title: '',
      hasFooter: true,
      hasNavbar: true,
    }
  }

  return {
    title: content.data.title,
    description: content.data.description,
    hasFooter: content.data.hasFooter,
    hasNavbar: content.data.hasNavbar,
  }
}
