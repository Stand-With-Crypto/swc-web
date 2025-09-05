import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient, DEFAULT_CACHE_IN_SECONDS } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPartners, zodPartnerSchemaValidation } from '@/utils/shared/zod/getSWCPartners'

const logger = getLogger(`builderIOPartners`)

const LIMIT = 100

async function getAllPartnersWithOffset({
  offset,
  countryCode,
}: {
  offset: number
  countryCode: SupportedCountryCodes
}) {
  const retryPromise = pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.PARTNERS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          'data.countryCode': {
            $elemMatch: {
              $eq: countryCode.toUpperCase(),
            },
          },
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: DEFAULT_CACHE_IN_SECONDS,
        limit: LIMIT,
        fields: 'data',
        offset,
      }),
    {
      retries: 2,
      minTimeout: 5000,
    },
  )

  const timeout = SECONDS_DURATION['10_SECONDS'] * 1000

  const result = await resolveWithTimeout(retryPromise, timeout)

  return result
}

export async function getPartners({ countryCode }: { countryCode: SupportedCountryCodes }) {
  try {
    let offset = 0

    const entries = await getAllPartnersWithOffset({ offset, countryCode })

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllPartnersWithOffset({ offset, countryCode })))
    }

    const filteredIncompletePartners = entries
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
