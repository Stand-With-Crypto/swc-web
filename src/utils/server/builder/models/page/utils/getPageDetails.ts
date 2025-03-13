import * as Sentry from '@sentry/nextjs'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import {
  BuilderPageModelIdentifiers,
  InternationalBuilderPageModel,
} from '@/utils/server/builder/models/page/constants'

export interface PageMetadata {
  title: string
  description?: string
  hasFooter: boolean
  hasNavbar: boolean
}

export async function getPageDetails(
  pageModelName: BuilderPageModelIdentifiers | InternationalBuilderPageModel,
  pathname: string,
): Promise<PageMetadata> {
  const content = await builderSDKClient
    .get(pageModelName, {
      userAttributes: {
        urlPath: pathname,
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
      fields: 'data',
    })
    .toPromise()

  if (!content?.data) {
    Sentry.captureMessage(`Page content not found for model ${pageModelName}`, {
      extra: {
        pathname,
        content,
      },
      tags: {
        domain: 'builder.io',
        model: pageModelName,
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
