import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'

export function getPageContent(pageModelName: BuilderPageModelIdentifiers, pathname: string) {
  return builderSDKClient
    .get(pageModelName, {
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
}
