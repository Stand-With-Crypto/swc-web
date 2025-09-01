import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  SWCPetitionFromBuilderIO,
  zodPetitionSchemaValidation,
} from '@/utils/shared/zod/getSWCPetitions'

const logger = getLogger(`builderIOEvents`)

const isProduction = NEXT_PUBLIC_ENVIRONMENT === 'production'

const LIMIT = 100

export async function getAllPetitionsFromBuilderIO({
  countryCode,
  offset = 0,
}: {
  countryCode: SupportedCountryCodes
  offset?: number
}): Promise<SWCPetitionFromBuilderIO[]> {
  try {
    const entries = await pRetry(
      () =>
        builderSDKClient.getAll(BuilderDataModelIdentifiers.PETITIONS, {
          query: {
            data: {
              countryCode: countryCode.toUpperCase(),
            },
            ...(isProduction && { published: 'published' }),
          },
          includeUnpublished: !isProduction,
          cacheSeconds: 60,
          limit: LIMIT,
          offset,
        }),
      {
        retries: 3,
        minTimeout: 10000,
      },
    )

    if (!entries || !Array.isArray(entries)) {
      return []
    }

    const validPetitions = entries
      .map(entry => {
        const validEntry = zodPetitionSchemaValidation.safeParse(entry)
        if (!validEntry.success) {
          logger.warn('Invalid petition entry:', validEntry.error.errors)
          return null
        }
        return validEntry.data.data
      })
      .filter(Boolean) as SWCPetitionFromBuilderIO[]

    return validPetitions
  } catch (error) {
    logger.error('error getting all petitions:' + error)
    Sentry.captureException(error, {
      level: 'error',
      tags: { domain: 'getAllPetitions' },
    })
    return []
  }
}

export async function getPetitionFromBuilderIO(
  countryCode: SupportedCountryCodes,
  slug: string,
): Promise<SWCPetitionFromBuilderIO | null> {
  try {
    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.PETITIONS, {
          query: {
            data: {
              countryCode: countryCode.toUpperCase(),
              slug,
            },
            ...(isProduction && { published: 'published' }),
          },
          includeUnpublished: !isProduction,
          cacheSeconds: 60,
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    if (!entry) {
      return null
    }

    const validEntry = zodPetitionSchemaValidation.safeParse(entry)

    if (!validEntry.success) {
      logger.warn('Invalid petition entry:', validEntry.error.errors)
      return null
    }

    return validEntry.data.data
  } catch (error) {
    logger.error('error getting petition:' + error)
    Sentry.captureException(error, {
      level: 'error',
      tags: { domain: 'getPetition' },
    })
    return null
  }
}
