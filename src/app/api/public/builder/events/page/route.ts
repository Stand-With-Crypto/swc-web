import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const logger = getLogger('builder-webhook-events-page-route')

interface EventValue {
  id: string
  name: string
  modelId: string
  published: string
  meta: {
    hasLinks: boolean
    kind: string
    lastPreviewUrl: string
  }
  query: Array<{
    property: string
    operator: string
    value: string
  }>
  data: {
    themeId: boolean
    title: string
    blocksString: string
  }
  metrics: {
    clicks: number
    impressions: number
  }
  variations: Record<string, unknown>
  lastUpdated: number
  createdDate: number
  testRatio: number
  createdBy: string
}

interface PageEventBody {
  operation: 'publish' | 'archive' | 'delete' | 'unpublish' | 'scheduledStart' | 'scheduledEnd'
  modelName: string
  newValue?: EventValue
  previousValue?: EventValue
}

export const POST = withBuilderIoAuthMiddleware(async (request: NextRequest) => {
  const body = (await request.json()) as PageEventBody

  const query = body.newValue?.query ?? body.previousValue?.query ?? []

  if (!query) {
    Sentry.captureMessage('No query found in Builder.io webhook event', {
      extra: { ...body },
      tags: {
        domain: 'builder.io',
      },
    })
    return new NextResponse('No query found', {
      status: 400,
    })
  }

  query.forEach(({ property, value }) => {
    if (property === 'urlPath') {
      logger.info(`Revalidating path: ${value}`)
      revalidatePath(value)
      ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode => revalidatePath(`/${countryCode}${value}`))
    }
  })

  return new NextResponse('Success', {
    status: 200,
  })
})
