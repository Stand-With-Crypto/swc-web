import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { SWCPartners, zodPartnerSchemaValidation } from '@/utils/shared/getSWCPartners'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`builderIOPartners`)

const LIMIT = 100

async function getAllPartnersWithOffset(offset: number) {
  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.PARTNERS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        limit: LIMIT,
        fields: 'data',
        offset,
        cachebust: true,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
}

export async function getPartners() {
  try {
    let offset = 0

    const entries = await getAllPartnersWithOffset(offset)

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllPartnersWithOffset(offset)))
    }

    const filteredIncompletePartners = entries
      .map(entry => {
        const validEntry = zodPartnerSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as SWCPartners

    if (filteredIncompletePartners.length === 0) return null

    return filteredIncompletePartners
  } catch (e) {
    logger.error('error getting all partners:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getPartners' },
    })
    return null
  }
}
