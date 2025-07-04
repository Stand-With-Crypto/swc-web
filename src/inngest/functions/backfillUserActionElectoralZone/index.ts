import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

import {
  BACKFILL_USER_ACTION_ELECTORAL_ZONE_BATCH_SIZE,
  BACKFILL_USER_ACTION_ELECTORAL_ZONE_RETRY_LIMIT,
  BATCH_BUFFER,
} from './config'
import { backfillUserActionElectoralZoneProcessor } from './logic'

const BACKFILL_USER_ACTION_ELECTORAL_ZONE_COORDINATOR_FUNCTION_ID =
  'script.backfill-user-action-electoral-zone-coordinator'
export const BACKFILL_USER_ACTION_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME =
  'script/backfill-user-action-electoral-zone-coordinator'

export interface BackfillUserActionElectoralZoneCoordinatorEventSchema {
  name: typeof BACKFILL_USER_ACTION_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME
  data: {
    persist?: boolean
  }
}

export const backfillUserActionElectoralZoneCoordinator = inngest.createFunction(
  {
    id: BACKFILL_USER_ACTION_ELECTORAL_ZONE_COORDINATOR_FUNCTION_ID,
    retries: BACKFILL_USER_ACTION_ELECTORAL_ZONE_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_USER_ACTION_ELECTORAL_ZONE_COORDINATOR_EVENT_NAME,
  },
  async ({ step, logger, event }) => {
    const persist = event.data.persist ?? false
    if (!persist) {
      logger.info('DRY RUN MODE: No changes will be written to the database.')
    }

    const userActionCount = await step.run('get-user-action-count', () =>
      prismaClient.userActionViewKeyRaces.count({
        where: {
          electoralZone: null,
        },
      }),
    )

    if (userActionCount === 0) {
      logger.info('No user actions to backfill.')
      return {
        message: 'No user actions to backfill.',
      }
    }

    const totalBatches = Math.ceil(userActionCount / BACKFILL_USER_ACTION_ELECTORAL_ZONE_BATCH_SIZE)
    logger.info(
      `Found ${userActionCount} user actions to backfill, splitting into ${totalBatches} batches.`,
    )

    const invokeEvents = []
    for (let i = 0; i < totalBatches * BATCH_BUFFER; i++) {
      invokeEvents.push(
        step.invoke(`invoke-processor-batch-${i}`, {
          function: backfillUserActionElectoralZoneProcessor,
          data: {
            skip: i * BACKFILL_USER_ACTION_ELECTORAL_ZONE_BATCH_SIZE,
            take: BACKFILL_USER_ACTION_ELECTORAL_ZONE_BATCH_SIZE,
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
