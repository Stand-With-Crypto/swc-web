import type { Content } from '@builder.io/react'

import {
  PAGE_MODEL_IDENTIFIER,
  PAGE_PREFIX,
} from '@/utils/server/builder/models/page/dynamicContent/constants'
import { serverCMS } from '@/utils/server/builder/serverCMS'

export async function getDynamicPageContent(pathname?: string): Promise<Content | undefined> {
  return serverCMS
    .get(PAGE_MODEL_IDENTIFIER, {
      userAttributes: {
        urlPath: PAGE_PREFIX + (pathname ?? ''),
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    .toPromise()
}
