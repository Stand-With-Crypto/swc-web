import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { SWCEvents, zodEventSchemaValidation } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`builderIOEvents`)
export async function getEvents() {
  try {
    const entries = await pRetry(
      () =>
        builderIOClient.getAll('events', {
          query: {
            ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
            data: {
              isOccuring: true,
            },
          },
          includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
          cacheSeconds: 60,
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    const filteredIncompleteEvents = entries
      .map(entry => {
        const validEntry = zodEventSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as SWCEvents

    if (filteredIncompleteEvents.length === 0) return null

    return filteredIncompleteEvents
  } catch (e) {
    logger.error('error getting events entries:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}
