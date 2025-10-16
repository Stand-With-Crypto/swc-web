import { waitUntil } from '@vercel/functions'
import { NextRequest, NextResponse } from 'next/server'

import { redis } from '@/utils/server/redis'
import { verifyPostgridWebhookSignature } from '@/utils/server/postgrid/verifyWebhookSignature'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgridWebhook')

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-postgrid-signature')

  // Verify webhook signature
  if (!verifyPostgridWebhookSignature(signature, rawBody)) {
    logger.error('Unauthorized PostGrid webhook request - invalid signature')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const body = JSON.parse(rawBody)
  logger.info('Received PostGrid webhook event', {
    eventId: body.id,
    eventType: body.type,
    letterId: body.data?.id,
  })

  // Extract country code from metadata or default to AU
  const countryCode = body.data?.metadata?.countryCode || 'au'
  const redisKey = `postgrid:webhook:events:${countryCode}`

  // Push event to Redis queue (fire and forget)
  waitUntil(
    redis
      .lpush(redisKey, rawBody)
      .then(() => {
        logger.info('Event pushed to Redis', { redisKey, eventId: body.id })
      })
      .catch(error => {
        logger.error('Failed to push event to Redis', {
          error: error instanceof Error ? error.message : String(error),
          eventId: body.id,
        })
      }),
  )

  // Return 200 immediately
  return new NextResponse('success', { status: 200 })
}

