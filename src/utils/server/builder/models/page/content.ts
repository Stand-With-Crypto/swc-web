import { builderSDKClient } from '@/utils/server/builder'
import { PageModelIdentifiers } from '@/utils/server/builder/models/page/constants'

export const PAGE_PREFIX = '/content/'

export function getDynamicPageContent(pathname: string) {
  return builderSDKClient
    .get(PageModelIdentifiers.CONTENT, {
      userAttributes: {
        urlPath: pathname,
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
      // Set cachebust to true to get the latest content
      cachebust: true,
    })
    .toPromise()
}
