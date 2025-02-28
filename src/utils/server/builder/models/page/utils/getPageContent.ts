import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import {
  BuilderPageModelIdentifiers,
  InternationalBuilderPageModel,
} from '@/utils/server/builder/models/page/constants'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export function getPageContent(
  pageModelName: BuilderPageModelIdentifiers,
  pathname: string,
  countryCode: SupportedCountryCodes,
) {
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

  return builderSDKClient
    .get(pageModel, {
      userAttributes: {
        urlPath,
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
      // Set cachebust to true to get the latest content.
      // This should only be used to generate static pages.
      cachebust: true,
    })
    .toPromise()
}
