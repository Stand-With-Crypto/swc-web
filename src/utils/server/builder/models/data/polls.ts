import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { SWCPoll, zodPollSchemaValidation } from '@/utils/shared/getSWCPolls'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`builderIOPolls`)

const LIMIT = 100

async function getAllPollsWithOffset(offset: number) {
  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.POLLS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: 60,
        limit: LIMIT,
        fields: 'id,name,data',
        offset,
        cachebust: true,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
}

export async function getPolls() {
  try {
    let offset = 0

    const entries = await getAllPollsWithOffset(offset)

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllPollsWithOffset(offset)))
    }

    const filteredIncompletePolls = entries
      .map(entry => {
        const validEntry = zodPollSchemaValidation.safeParse(entry)

        if (!validEntry.success) {
          logger.warn('invalid poll entry', {
            entry,
            validEntry,
          })

          return null
        }

        return validEntry.data
      })
      .filter(Boolean) as SWCPoll[]

    if (filteredIncompletePolls.length === 0) return null

    return filteredIncompletePolls
  } catch (e) {
    logger.error('error getting all polls:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'polls' },
    })
    return null
  }
}
