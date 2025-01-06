import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { serverCMS } from '@/utils/server/builder/serverCMS'
import { SWCEvents, zodEventSchemaValidation } from '@/utils/shared/getSWCEvents'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`builderIOEvents`)

export async function getEvent(eventSlug: string, state: string) {
  try {
    const entry = await pRetry(
      () =>
        serverCMS.get('events', {
          query: {
            data: {
              slug: eventSlug,
              state: state.toUpperCase(),
              isOccuring: true,
            },
            ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          },
          includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
          cacheSeconds: 60,
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
    logger.error('error getting single event:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}

const LIMIT = 100

async function getAllEventsWithOffset(offset: number) {
  return await pRetry(
    () =>
      serverCMS.getAll('events', {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          data: {
            isOccuring: true,
          },
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: 60,
        limit: LIMIT,
        offset,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
}

export async function getEvents() {
  try {
    let offset = 0

    const entries = await getAllEventsWithOffset(offset)

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllEventsWithOffset(offset)))
    }

    const filteredIncompleteEvents = entries
      .map(entry => {
        const validEntry = zodEventSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as SWCEvents

    if (filteredIncompleteEvents.length === 0) return null

    return filteredIncompleteEvents
  } catch (e) {
    logger.error('error getting all events:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}
