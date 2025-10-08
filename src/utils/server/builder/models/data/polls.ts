import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_LOCALE } from '@/utils/shared/supportedLocales'
import { SWCPoll, zodPollSchemaValidation } from '@/utils/shared/zod/getSWCPolls'

const logger = getLogger(`builderIOPolls`)

const LIMIT = 100

async function getAllPollsWithOffset({
  offset,
  countryCode,
}: {
  offset: number
  countryCode: SupportedCountryCodes
}) {
  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.POLLS, {
        query: {
          data: {
            countryCode: countryCode.toUpperCase(),
          },
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
        },
        locale: DEFAULT_LOCALE,
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

export async function getPolls({ countryCode }: { countryCode: SupportedCountryCodes }) {
  try {
    let offset = 0

    const entries = await getAllPollsWithOffset({ offset, countryCode })

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllPollsWithOffset({ offset, countryCode })))
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
