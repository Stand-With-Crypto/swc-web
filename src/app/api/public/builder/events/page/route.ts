import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { prettyStringify } from '@/utils/shared/prettyLog'

const logger = getLogger('builder-events-page-route')

interface EventValue {
  ownerId: string
  lastUpdateBy: string | null
  createdDate: number
  id: string
  '@version': number
  name: string
  modelId: string
  published: string
  meta: {
    hasLinks: boolean
    kind: string
    lastPreviewUrl: string
  }
  priority: number
  query: Array<{
    '@type': string
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
  firstPublished: number
  testRatio: number
  screenshot: string
  createdBy: string
  lastUpdatedBy: string
  folders: any[]
}

interface PageEventBody {
  operation: string
  modelName: string
  newValue: EventValue
  previousValue: EventValue
}

export const POST = withRouteMiddleware(async (request: NextRequest) => {
  // TODO: validate request headers

  const body = (await request.json()) as PageEventBody

  logger.info('Received page event', prettyStringify(body))

  body.newValue.query.forEach(query => {
    if (query.property === 'urlPath') {
      const urlPath = query.value

      logger.info('Revalidating path', urlPath)

      // revalidatePath(urlPath)
    }
  })

  return new NextResponse('success', {
    status: 200,
  })
})
