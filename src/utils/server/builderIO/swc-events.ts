import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { SWCEvents, zodEventsSchemaValidation } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger(`builderIOEvents`)
export async function getEvents() {
  try {
    const entries = await pRetry(() => builderIOClient.getAll('events'), {
      retries: 3,
      minTimeout: 5000,
    })

    const parsedEntries = zodEventsSchemaValidation.safeParse(entries)

    if (!parsedEntries.success) return null

    const filteredPublishedEvents = parsedEntries.data.filter(
      event => event.data.isOccuring && event.published === 'published',
    )

    return filteredPublishedEvents as SWCEvents
  } catch (e) {
    logger.error('error getting events entries:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}
