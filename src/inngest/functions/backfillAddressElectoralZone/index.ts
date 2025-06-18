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
    const addressCount = await step.run('get-address-count', async () => {
      return prismaClient.address.count({
        where: {
          electoralZone: null,
        },
      })
    })
    logger.info(`Found ${addressCount} addresses to backfill.`)

    const addressCursors: string[] = []
    let lastCursor: string | undefined

    const totalBatches = Math.ceil(addressCount / BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE)
    logger.info(`Splitting into ${totalBatches} batches.`)

    for (
      let i = 0;
      i < addressCount * BATCH_BUFFER;
      i += BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE
    ) {
      const row = await step.run(`get-address-cursor-${i}`, async () => {
        return prismaClient.address.findFirst({
          select: { id: true },
          orderBy: { id: 'asc' },
          where: {
            electoralZone: null,
            ...(lastCursor && { id: { gt: lastCursor } }),
          },
        })
      })
      if (row) {
        addressCursors.push(row.id)
        const lastRowInBatch = await prismaClient.address.findFirst({
          select: { id: true },
          orderBy: { id: 'asc' },
          where: {
            electoralZone: null,
            id: { gte: row.id },
          },
          skip: BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE - 1,
        })
        lastCursor = lastRowInBatch?.id || row.id
      } else {
        break
      }
    }

    logger.info(
      `${!persist ? '[DRY RUN] ' : ''}Fan out to ${addressCursors.length} processor jobs.`,
    )
    for (const cursor of addressCursors) {
      await step.invoke(`send-batch-of-addresses-${cursor}`, {
        function: backfillAddressElectoralZoneProcessor,
        data: {
          addressCursor: cursor,
          persist,
        },
      })
    }

    return {
      dryRun: !persist,
      message: `Successfully enqueued ${addressCursors.length} batches.`,
    }
  },
)
