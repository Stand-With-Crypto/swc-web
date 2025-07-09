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
import { backfillAddressFieldsWithGooglePlacesProcessor, ProcessorResult } from './logic'

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
      const message = `Country code ${countryCodeParam} is not supported.`
      logger.info(message)
      return {
        message,
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
      const message = 'No addresses to backfill.'
      logger.info(message)
      return {
        message,
      }
    }

    let lastProcessedId: string | undefined = undefined
    let totalFailedInvocations = 0
    let processedCount = 0

    const addressesToProcess = limit ? Math.min(addressCount, limit) : addressCount
    const totalBatches = Math.ceil(
      addressesToProcess / BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE,
    )
    const batchesWithBuffer = Math.ceil(totalBatches * BATCH_BUFFER)

    logger.info(
      `Found ${addressCount} addresses matching criteria${limit ? `, limited to ${addressesToProcess}` : ''}. Splitting into ${totalBatches} batches (${batchesWithBuffer} with buffer).`,
    )

    for (let i = 0; i < batchesWithBuffer; i++) {
      const remainingToProcess = addressesToProcess - processedCount
      const take = Math.min(
        BACKFILL_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_BATCH_SIZE,
        remainingToProcess,
      )

      if (take <= 0) break

      try {
        const result: ProcessorResult = await step.invoke(`invoke-processor-batch-${i}`, {
          function: backfillAddressFieldsWithGooglePlacesProcessor,
          data: {
            lastProcessedId,
            take,
            persist,
            countryCode,
          },
        })

        if (result) {
          lastProcessedId = result.lastProcessedId
          processedCount += (result.totalSuccess || 0) + (result.totalFailed || 0)
        }
      } catch (error) {
        logger.error('Failed to invoke processor job', { error })
        totalFailedInvocations += 1
      }
    }

    return {
      dryRun: !persist,
      message: `Finished processing ${batchesWithBuffer} batches${limit ? ` (limited to ${addressesToProcess} addresses)` : ''}.`,
      successfulBatches: batchesWithBuffer - totalFailedInvocations,
      failedBatches: totalFailedInvocations,
      totalAddressesTargeted: addressesToProcess,
      finalLastProcessedId: lastProcessedId,
    }
  },
)
