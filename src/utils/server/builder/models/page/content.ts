import { PageModelIdentifiers } from '@/utils/server/builder/models/page/uniqueIdentifiers'
import { serverCMS } from '@/utils/server/builder/serverCMS'

export const PAGE_PREFIX = '/content/'

export function getDynamicPageContent(page: string[]) {
  const pathname = page?.join('/')

  return serverCMS
    .get(PageModelIdentifiers.CONTENT, {
      userAttributes: {
        urlPath: PAGE_PREFIX + pathname,
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    .toPromise()
}
