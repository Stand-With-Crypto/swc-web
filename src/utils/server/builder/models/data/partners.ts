import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient, DEFAULT_CACHE_IN_SECONDS } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_LOCALE } from '@/utils/shared/supportedLocales'
import { SWCPartners, zodPartnerSchemaValidation } from '@/utils/shared/zod/getSWCPartners'

const logger = getLogger(`builderIOPartners`)

const isProduction = NEXT_PUBLIC_ENVIRONMENT === 'production'

export async function getPartners({ countryCode }: { countryCode: SupportedCountryCodes }) {
  try {
    const timeout = SECONDS_DURATION['10_SECONDS'] * 1000

    const result = await resolveWithTimeout(
      pRetry(
        () =>
          builderSDKClient.getAll(BuilderDataModelIdentifiers.PARTNERS, {
            query: {
              ...(isProduction && { published: 'published' }),
              'data.countryCode': {
                $elemMatch: {
                  $eq: countryCode.toUpperCase(),
                },
              },
            },
            locale: DEFAULT_LOCALE,
            includeUnpublished: !isProduction,
            cacheSeconds: DEFAULT_CACHE_IN_SECONDS,
            fields: 'data',
          }),
        {
          retries: 2,
          minTimeout: 5000,
        },
      ),
      timeout,
    )

    const filteredIncompletePartners = result
      .map(entry => {
        const validEntry = zodPartnerSchemaValidation.safeParse(entry)

        if (!validEntry.success) {
          logger.warn('invalid partner entry', {
            entry,
            validEntry,
          })

          return null
        }

        return validEntry.data
      })
      .filter(Boolean) as SWCPartners

    if (filteredIncompletePartners.length === 0) return null

    return filteredIncompletePartners
  } catch (e) {
    logger.error('error getting all partners:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'partners' },
    })
    return null
  }
}
