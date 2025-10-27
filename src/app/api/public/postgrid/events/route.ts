import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { POSTGRID_EVENTS_REDIS_KEY } from '@/inngest/functions/postgrid/utils'
import { verifyPostgridWebhookSignature } from '@/utils/server/postgrid/verifyWebhookSignature'
import { redis } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgridWebhook')

export async function POST(request: NextRequest) {
  const jwtPayload = await request.text()

  const payload = verifyPostgridWebhookSignature(jwtPayload)
  if (!payload) {
    logger.error('Unauthorized PostGrid webhook request - invalid signature')
    Sentry.captureMessage('Unauthorized PostGrid webhook request - invalid signature', {
      extra: {
        jwtPayload,
      },
      tags: {
        domain: 'postgridWebhook',
      },
    })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  logger.info('Received PostGrid webhook event', {
    eventType: payload.type,
    letterId: payload.data.id,
    ...payload.data.metadata,
  })

  await redis.lpush(POSTGRID_EVENTS_REDIS_KEY, JSON.stringify(payload))
  logger.info('PostGrid webhook event pushed to Redis', {
    letterId: payload.data.id,
    ...payload.data.metadata,
  })

  return new NextResponse()
}
