import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { SWCPartners, zodPartnerSchemaValidation } from '@/utils/shared/getSWCPartners'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger(`builderIOPartners`)

const LIMIT = 100

async function getAllPartnersWithOffset({
  offset,
  countryCode,
}: {
  offset: number
  countryCode: SupportedCountryCodes
}) {
  return await pRetry(
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
        cacheSeconds: 60,
        limit: LIMIT,
        fields: 'data',
        offset,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
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
