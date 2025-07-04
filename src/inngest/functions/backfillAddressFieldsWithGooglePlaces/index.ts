import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import {
  BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE,
  BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_RETRY_LIMIT,
  BATCH_BUFFER,
} from './config'
import { backfillAddressFieldsWithGooglePlacesProcessor } from './logic'

const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_COORDINATOR_FUNCTION_ID =
  'script.backfill-address-fields-with-google-places-coordinator'
export const BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_COORDINATOR_EVENT_NAME =
  'script/backfill-address-fields-with-google-places-coordinator'

export interface BackfillAddressFieldsWithGooglePlacesCoordinatorEventSchema {
  name: typeof BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_COORDINATOR_EVENT_NAME
  data: {
    persist?: boolean
    countryCode?: string
    limit?: number
  }
}

export const backfillAddressFieldsWithGooglePlacesCoordinator = inngest.createFunction(
  {
    id: BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_COORDINATOR_FUNCTION_ID,
    retries: BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_COORDINATOR_EVENT_NAME,
  },
  async ({ step, logger, event }) => {
    const { countryCode: countryCodeParam, persist = false, limit } = event.data

    if (countryCodeParam && !ORDERED_SUPPORTED_COUNTRIES.includes(countryCodeParam.toLowerCase())) {
      logger.info('Country code is not supported.')
      return {
        message: 'Country code is not supported.',
      }
    }

    const countryCode = countryCodeParam?.toLowerCase() as SupportedCountryCodes

    if (!persist) {
      logger.info('DRY RUN MODE: No changes will be written to the database.')
    }

    const addressCount = await step.run('get-address-count', () =>
      prismaClient.address.count({
        where: {
          countryCode,
          formattedDescription: {
            not: {
              contains: 'test',
            },
          },
          OR: [
            {
              electoralZone: null,
            },
            {
              administrativeAreaLevel1: '',
            },
          ],
        },
      }),
    )

    if (addressCount === 0) {
      logger.info('No addresses to backfill.')
      return {
        message: 'No addresses to backfill.',
      }
    }

    const addressesToProcess = limit ? Math.min(addressCount, limit) : addressCount
    const totalBatches = Math.ceil(
      addressesToProcess / BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE,
    )
    logger.info(
      `Found ${addressCount} addresses matching criteria${limit ? `, limited to ${addressesToProcess}` : ''}. Splitting into ${totalBatches} batches (${Math.ceil(totalBatches * BATCH_BUFFER)} with buffer).`,
    )

    const invokeEvents = []
    const batchesWithBuffer = Math.ceil(totalBatches * BATCH_BUFFER)

    for (let i = 0; i < batchesWithBuffer; i++) {
      const skip = i * BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE
      const remainingAddresses = addressesToProcess - skip
      const take = Math.min(
        BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE,
        remainingAddresses,
      )

      if (take <= 0) break

      invokeEvents.push(
        step.invoke(`invoke-processor-batch-${i}`, {
          function: backfillAddressFieldsWithGooglePlacesProcessor,
          data: {
            skip,
            take,
            persist,
            countryCode,
          },
        }),
      )
    }

    const results = await Promise.allSettled(invokeEvents)

    const failedInvocations = results.filter(r => r.status === 'rejected')
    if (failedInvocations.length > 0) {
      logger.error(`Failed to invoke ${failedInvocations.length} processor jobs.`, {
        errors: failedInvocations.map(f => f.reason),
      })
    }

    return {
      dryRun: !persist,
      message: `Finished processing ${batchesWithBuffer} batches${limit ? ` (limited to ${addressesToProcess} addresses)` : ''}.`,
      successfulBatches: batchesWithBuffer - failedInvocations.length,
      failedBatches: failedInvocations.length,
      totalAddressesTargeted: addressesToProcess,
    }
  },
)
