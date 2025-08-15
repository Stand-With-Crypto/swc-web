import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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
  const builderOptions = {
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
    fields: 'data',
  }

  const content = await pRetry(
    () => builderSDKClient.get(pageModelName, builderOptions).toPromise(),
    {
      retries: 2,
      minTimeout: 4000,
    },
  ).catch(error => {
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

  if (!content?.data) {
    Sentry.captureMessage(`Page content not found for model ${pageModelName}`, {
      extra: {
        pathname,
        content,
      },
      tags: {
        domain: 'builder.io',
        model: pageModelName,
        countryCode,
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
