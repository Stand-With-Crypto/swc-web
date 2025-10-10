import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { DEFAULT_CACHE_IN_SECONDS } from '@/utils/server/builder'
import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_LOCALE } from '@/utils/shared/supportedLocales'
import { SWCFounder, zodFoundersSchemaValidation } from '@/utils/shared/zod/getSWCFounders'

const logger = getLogger(`builderIOFounders`)

async function getAllFounders({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const timeout = SECONDS_DURATION['10_SECONDS'] * 1000

  return await resolveWithTimeout(
    pRetry(
      () =>
        builderSDKClient.getAll(BuilderDataModelIdentifiers.FOUNDERS, {
          query: {
            ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
            'data.countryCode': {
              $elemMatch: {
                $eq: countryCode.toUpperCase(),
              },
            },
          },
          locale: DEFAULT_LOCALE,
          cacheSeconds: DEFAULT_CACHE_IN_SECONDS,
          includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
          fields: 'data',
        }),
      {
        retries: 2,
        minTimeout: 5000,
      },
    ),
    timeout,
  )
}

export async function getFounders({ countryCode }: { countryCode: SupportedCountryCodes }) {
  try {
    const entries = await getAllFounders({ countryCode })

    const filteredIncompleteFounders = entries
      .map(entry => {
        const validEntry = zodFoundersSchemaValidation.safeParse(entry)

        if (!validEntry.success) {
          logger.warn('invalid founder entry', {
            entry,
            validEntry,
          })

          return null
        }

        return validEntry.data
      })
      .filter(Boolean) as SWCFounder[]

    if (filteredIncompleteFounders.length === 0) return null

    return filteredIncompleteFounders
  } catch (e) {
    logger.error('error getting all founders:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'founders' },
    })
    return null
  }
}
