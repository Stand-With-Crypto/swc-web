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
import { backfillSWCCivicAddressFieldsProcessor } from './logic'

const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_FUNCTION_ID =
  'script.backfill-swc-civic-address-fields-coordinator'
export const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_EVENT_NAME =
  'script/backfill-swc-civic-address-fields-coordinator'

export interface BackfillSWCCivicAddressFieldsCoordinatorEventSchema {
  name: typeof BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_COORDINATOR_EVENT_NAME
  data: {
    persist?: boolean
    countryCode?: string
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
    const { persist = false, countryCode: countryCodeParam } = event.data

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

    const totalBatches = Math.ceil(addressCount / BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE)
    logger.info(
      `Found ${addressCount} addresses to backfill, splitting into ${totalBatches} batches.`,
    )

    const invokeEvents = []
    for (let i = 0; i < totalBatches * BATCH_BUFFER; i++) {
      invokeEvents.push(
        step.invoke(`invoke-processor-batch-${i}`, {
          function: backfillSWCCivicAddressFieldsProcessor,
          data: {
            skip: i * BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
            take: BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
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
      message: `Finished processing ${totalBatches} batches.`,
      successfulBatches: totalBatches - failedInvocations.length,
      failedBatches: failedInvocations.length,
    }
  },
)
