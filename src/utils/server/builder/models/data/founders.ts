import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCFounders, zodFoundersSchemaValidation } from '@/utils/shared/zod/getSWCFounders'

const logger = getLogger(`builderIOFounders`)

async function getAllFounders({ countryCode }: { countryCode: SupportedCountryCodes }) {
  return await pRetry(
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
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        fields: 'data',
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
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
      .filter(Boolean) as SWCFounders

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
