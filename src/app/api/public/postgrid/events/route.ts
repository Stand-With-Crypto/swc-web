import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { POSTGRID_EVENTS_REDIS_KEY } from '@/inngest/functions/postgrid/utils'
import { PostGridWebhookEvent } from '@/utils/server/postgrid/types'
import { verifyPostgridWebhookSignature } from '@/utils/server/postgrid/verifyWebhookSignature'
import { redis } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgridWebhook')

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-postgrid-signature')

  if (!verifyPostgridWebhookSignature(signature, rawBody)) {
    logger.error('Unauthorized PostGrid webhook request - invalid signature')
    Sentry.captureMessage('Unauthorized PostGrid webhook request - invalid signature', {
      extra: {
        signature,
        rawBody,
      },
      tags: {
        domain: 'postgridWebhook',
      },
    })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const body = JSON.parse(rawBody) as PostGridWebhookEvent
  logger.info('Received PostGrid webhook event', {
    eventId: body.id,
    eventType: body.type,
    letterId: body.data?.id,
  })

  await redis.lpush(POSTGRID_EVENTS_REDIS_KEY, rawBody)
  logger.info('PostGrid webhook event pushed to Redis', {
    redisKey: POSTGRID_EVENTS_REDIS_KEY,
    eventId: body.id,
  })

  return new NextResponse('success', { status: 200 })
}
