import { UserActionLetterStatus } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { mapPostgridStatus } from '@/utils/server/postgrid/mapPostgridStatus'
import { prismaClient } from '@/utils/server/prismaClient'
import { redis } from '@/utils/server/redis'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

import {
  PROCESS_POSTGRID_WEBHOOK_EVENTS_EVENT_NAME,
  PROCESS_POSTGRID_WEBHOOK_EVENTS_FUNCTION_ID,
} from './types'
import { POSTGRID_EVENTS_REDIS_KEY } from './utils'

const CRON_SCHEDULE = '*/5 * * * *' // Every 5 minutes

interface PostGridWebhookEvent {
  id: string
  type: string
  data: {
    id: string // letter ID
    status: string
    metadata?: {
      userId?: string
      campaignName?: string
      countryCode?: string
      dtsiSlug?: string
    }
  }
}

export const processPostgridWebhookEvents = inngest.createFunction(
  {
    id: PROCESS_POSTGRID_WEBHOOK_EVENTS_FUNCTION_ID,
    retries: 2,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: CRON_SCHEDULE }
      : { event: PROCESS_POSTGRID_WEBHOOK_EVENTS_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    // Fetch all events from Redis
    const rawEvents = await step.run('fetch-events', async () => {
      const events = await redis.lrange(POSTGRID_EVENTS_REDIS_KEY, 0, -1)
      logger.info(`Fetched ${events.length} events from Redis`)
      return events
    })

    if (rawEvents.length === 0) {
      logger.info('No events to process')
      return {
        totalEventsProcessed: 0,
        totalStatusUpdates: 0,
      }
    }

    // Parse and deduplicate events
    const events = await step.run('parse-events', () => {
      const parsed: PostGridWebhookEvent[] = []
      const seenEventIds = new Set<string>()

      for (const rawEvent of rawEvents) {
        try {
          const event = JSON.parse(rawEvent) as PostGridWebhookEvent
          if (!seenEventIds.has(event.id)) {
            parsed.push(event)
            seenEventIds.add(event.id)
          }
        } catch (error) {
          logger.error('Failed to parse event', {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      logger.info(
        `Parsed ${parsed.length} unique events (${rawEvents.length - parsed.length} duplicates removed)`,
      )
      return parsed
    })

    // Group events by letter ID and keep latest status
    const latestEventByLetterId = new Map<string, PostGridWebhookEvent>()
    for (const event of events) {
      const letterId = event.data.id
      latestEventByLetterId.set(letterId, event)
    }

    logger.info(`Processing ${latestEventByLetterId.size} unique letters`)

    // Process updates in batches
    const updateCount = await step.run('update-database', async () => {
      let updates = 0

      for (const [letterId, event] of latestEventByLetterId.entries()) {
        try {
          const status = mapPostgridStatus(event.data.status)

          if (status === UserActionLetterStatus.UNKNOWN) {
            logger.warn(`Unknown PostGrid status: ${event.data.status}`, { letterId })
            continue
          }

          // Find the recipient by postgridOrderId
          const recipient = await prismaClient.userActionLetterRecipient.findUnique({
            where: { postgridOrderId: letterId },
          })

          if (!recipient) {
            logger.warn(`Recipient not found for PostGrid order ${letterId}`)
            continue
          }

          // Create status update record under recipient
          await prismaClient.userActionLetterStatusUpdate.create({
            data: {
              userActionLetterRecipientId: recipient.id,
              status,
            },
          })

          updates++
          logger.info(`Updated status for letter ${letterId} to ${status}`)
        } catch (error) {
          logger.error('Failed to process event', {
            letterId,
            error: error instanceof Error ? error.message : String(error),
          })
          Sentry.captureException(error, {
            tags: { domain: 'postgrid.processWebhookEvents' },
            extra: { letterId, event },
          })
        }
      }

      return updates
    })

    // Clear processed events from Redis
    await step.run('clear-redis', async () => {
      await redis.del(POSTGRID_EVENTS_REDIS_KEY)
      logger.info(`Cleared ${rawEvents.length} events from Redis key ${POSTGRID_EVENTS_REDIS_KEY}`)
    })

    const results = {
      totalEventsProcessed: events.length,
      totalStatusUpdates: updateCount,
    }

    logger.info('Webhook processing complete', results)
    return results
  },
)
