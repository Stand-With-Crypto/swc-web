import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import {
  BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
  BACKFILL_ADDRESS_ELECTORAL_ZONE_RETRY_LIMIT,
  BATCH_BUFFER,
} from './config'
import {
  backfillSWCCivicAddressFieldsProcessor,
  BackfillSWCCivicAddressFieldsProcessorResult,
} from './logic'

const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_FUNCTION_ID =
  'script.backfill-swc-civic-address-fields-coordinator'
export const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_EVENT_NAME =
  'script/backfill-swc-civic-address-fields-coordinator'

export interface BackfillSWCCivicAddressFieldsCoordinatorEventSchema {
  name: typeof BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_EVENT_NAME
  data: {
    persist?: boolean
    countryCode?: string
    limit?: number
  }
}

export const backfillSWCCivicAddressFieldsCoordinator = inngest.createFunction(
  {
    id: BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_FUNCTION_ID,
    retries: BACKFILL_ADDRESS_ELECTORAL_ZONE_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_EVENT_NAME,
  },
  async ({ step, logger, event }) => {
    const { persist = false, countryCode: countryCodeParam, limit } = event.data

    if (!persist) {
      logger.info('DRY RUN MODE: No changes will be written to the database.')
    }

    if (countryCodeParam && !ORDERED_SUPPORTED_COUNTRIES.includes(countryCodeParam.toLowerCase())) {
      const message = `Country code ${countryCodeParam} is not supported.`
      logger.info(message)
      return {
        message,
      }
    }

    const countryCode = countryCodeParam?.toLowerCase() as SupportedCountryCodes

    const addressCount = await step.run('get-address-count', () =>
      prismaClient.address.count({
        where: {
          OR: [{ electoralZone: null }, { swcCivicAdministrativeArea: null }],
          AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
          countryCode,
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
    const totalBatches = Math.ceil(addressesToProcess / BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE)

    if (limit) {
      logger.info(
        `Found ${addressCount} addresses, limiting to ${limit}. Processing ${addressesToProcess} addresses in ${totalBatches} batches.`,
      )
    } else {
      logger.info(
        `Found ${addressCount} addresses to backfill, splitting into ${totalBatches} batches.`,
      )
    }

    let cursor: string | undefined = undefined

    let totalFailedInvocations = 0
    let totalSuccessfulInvocations = 0
    let totalProcessedAddresses = 0

    for (let i = 0; i < totalBatches * BATCH_BUFFER; i++) {
      if (limit && totalProcessedAddresses >= limit) {
        logger.info(`Reached limit of ${limit} addresses. Stopping processing.`)
        break
      }

      // Calculate take size for this batch, considering the limit
      const remainingAddresses = limit ? limit - totalProcessedAddresses : undefined
      const batchSize = remainingAddresses
        ? Math.min(BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE, remainingAddresses)
        : BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE

      const results: BackfillSWCCivicAddressFieldsProcessorResult = await step.invoke(
        `invoke-processor-batch-${i}`,
        {
          function: backfillSWCCivicAddressFieldsProcessor,
          data: {
            take: batchSize,
            persist,
            countryCode,
            cursor,
          },
        },
      )

      cursor = results.newCursor
      totalFailedInvocations += results.totalFailed
      totalSuccessfulInvocations += results.totalSuccess
      totalProcessedAddresses += results.totalSuccess + results.totalFailed
    }

    return {
      dryRun: !persist,
      message: `Finished processing ${totalBatches} batches${limit ? ` (limited to ${limit} addresses)` : ''}.`,
      successfulBatches: totalSuccessfulInvocations,
      failedBatches: totalFailedInvocations,
      totalProcessedAddresses,
    }
  },
)
