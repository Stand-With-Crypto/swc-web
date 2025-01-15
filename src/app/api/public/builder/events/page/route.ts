import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { prettyStringify } from '@/utils/shared/prettyLog'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { ORDERED_SUPPORTED_LOCALES } from '@/utils/shared/supportedLocales'

const logger = getLogger('builder-events-page-route')

const BUILDER_IO_WEBHOOK_AUTH_TOKEN = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_WEBHOOK_AUTH_TOKEN,
  'BUILDER_IO_WEBHOOK_AUTH_TOKEN',
  "Builder.io webhook's auth token",
)!

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

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization')

  logger.info('Headers: ', prettyStringify(request.headers))

  if (authHeader !== `Bearer ${BUILDER_IO_WEBHOOK_AUTH_TOKEN}`) {
    Sentry.captureMessage('Received unauthorized request to Builder.io webhook', {
      extra: {
        ...request,
      },
      tags: {
        domain: 'builder.io',
      },
    })

    return new NextResponse('Unauthorized', {
      status: 401,
    })
  }

  const body = (await request.json()) as PageEventBody

  logger.info('Body: ', prettyStringify(body))

  body.newValue?.query.forEach(query => {
    if (query.property === 'urlPath') {
      const urlPath = query.value

      logger.info('Revalidating: ', urlPath)

      revalidatePath(urlPath)
      ORDERED_SUPPORTED_LOCALES.forEach(locale => revalidatePath(`/${locale}${urlPath}`))
    }
  })

  return new NextResponse('Success', {
    status: 200,
  })
})
