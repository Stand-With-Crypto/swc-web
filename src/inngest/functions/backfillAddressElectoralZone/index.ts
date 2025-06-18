import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

import {
  BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
  BACKFILL_ADDRESS_ELECTORAL_ZONE_RETRY_LIMIT,
  BATCH_BUFFER,
} from './config'
import { backfillAddressElectoralZoneProcessor } from './logic'

const BACKFILL_ADDRESS_ELECTORAL_ZONE_COORDINATOR_FUNCTION_ID =
  'script.backfill-address-electoral-zone-coordinator'
export const BACKFILL_ADDRESS_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME =
  'script/backfill-address-electoral-zone-coordinator'

export interface BackfillAddressElectoralZoneCoordinatorEventSchema {
  name: typeof BACKFILL_ADDRESS_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME
  data: {
    persist?: boolean
  }
}

export const backfillAddressElectoralZoneCoordinator = inngest.createFunction(
  {
    id: BACKFILL_ADDRESS_ELECTORAL_ZONE_COORDINATOR_FUNCTION_ID,
    retries: BACKFILL_ADDRESS_ELECTORAL_ZONE_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_ADDRESS_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME,
  },
  async ({ step, logger, event }) => {
    const persist = event.data.persist ?? false
    if (!persist) {
      logger.info('DRY RUN MODE: No changes will be written to the database.')
    }

    const addressCount = await step.run('get-address-count', () =>
      prismaClient.address.count({
        where: {
          electoralZone: null,
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
          function: backfillAddressElectoralZoneProcessor,
          data: {
            skip: i * BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
            take: BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
            persist,
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
