import * as Sentry from '@sentry/nextjs'

import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent } from '@/utils/server/builder/models/page/utils'

export interface PageMetadata {
  title: string
  description?: string
  hasFooter: boolean
  hasNavbar: boolean
}

export async function getPageDetails(
  pageModelName: BuilderPageModelIdentifiers,
  pathname: string,
): Promise<PageMetadata> {
  const content = await getPageContent(pageModelName, pathname)

  if (!content?.data) {
    Sentry.captureMessage(`Page content not found for model ${pageModelName}`, {
      extra: {
        pathname,
        content,
      },
      tags: {
        domain: 'builder.io',
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
