import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { SWCEvents, zodEventsSchemaValidation } from '@/utils/shared/getSWCEvents'
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
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    const parsedEntries = zodEventsSchemaValidation.safeParse(entries)

    if (!parsedEntries.success) return null

    return parsedEntries.data as SWCEvents
  } catch (e) {
    logger.error('error getting events entries:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}
