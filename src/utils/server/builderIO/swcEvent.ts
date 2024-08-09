import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { SWCEvents, zodEventSchemaValidation } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`builderIOEvent`)
export async function getEvent(eventSlug: string, state: string) {
  try {
    const entry = await pRetry(
      () =>
        builderIOClient.get('events', {
          query: {
            data: {
              slug: eventSlug,
              state: state.toUpperCase(),
              isOccuring: true,
            },
            ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          },
          includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    const parsedEntry = zodEventSchemaValidation.safeParse(entry)

    if (!parsedEntry.success) {
      return null
    }

    return parsedEntry.data as SWCEvents[0]
  } catch (e) {
    logger.error('error getting events entries:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}
