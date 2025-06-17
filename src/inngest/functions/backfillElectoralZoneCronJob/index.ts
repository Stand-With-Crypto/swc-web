import { Address } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { maybeGetElectoralZoneFromAddress } from '@/utils/shared/getElectoralZoneFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export interface BackfillElectoralZonesInngestCronJobSchema {
  name: 'script/backfill.electoral.zones.cron.job'
}

const defaultLogger = getLogger('backfillElectoralZonesCronJob')

const BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_FUNCTION_ID =
  'script.backfill-electoral-zones-cron-job'
const BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_EVENT_NAME =
  'script/backfill.electoral.zones.cron.job'

const BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_SCHEDULE = '0 9 * * *' //everyday 09:00AM UTC or 01:00 AM PST

const BACKFILL_ELECTORAL_ZONES_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL) || 60 * 1000 // 1 minute.
const BACKFILL_ELECTORAL_ZONES_BATCH_SIZE =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE) || 250 // Our quota is 500 queries per minute
const MAX_ELECTORAL_ZONES_BACKFILL_COUNT =
  Number(process.env.MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT) || 150000 // Our quota is 250000 queries per day

export const backfillElectoralZoneCronJob = inngest.createFunction(
  {
    id: BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_SCHEDULE }
      : { event: BACKFILL_ELECTORAL_ZONES_INNGEST_CRON_JOB_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    let currentCursor: string | undefined = undefined
    const numBatches = Math.ceil(
      MAX_ELECTORAL_ZONES_BACKFILL_COUNT / BACKFILL_ELECTORAL_ZONES_BATCH_SIZE,
    )

    for (let i = 1; i <= numBatches; i++) {
      const addressBatch = await step.run('script.get-addresses', async () => {
        const rowsToTake =
          i * BACKFILL_ELECTORAL_ZONES_BATCH_SIZE > MAX_ELECTORAL_ZONES_BACKFILL_COUNT
            ? MAX_ELECTORAL_ZONES_BACKFILL_COUNT - BACKFILL_ELECTORAL_ZONES_BATCH_SIZE * (i - 1)
            : BACKFILL_ELECTORAL_ZONES_BATCH_SIZE

        return await prismaClient.address.findMany({
          select: { id: true, formattedDescription: true, countryCode: true },
          where: { electoralZone: null },
          cursor: currentCursor ? { id: currentCursor } : undefined,
          skip: currentCursor ? 1 : 0,
          take: rowsToTake,
        })
      })

      if (!addressBatch.length) break

      currentCursor = addressBatch[addressBatch.length - 1].id

      await step.run('scripts.backfill-electoral-zones', async () => {
        if (!addressBatch.length) {
          logger.info(`No more addresses to backfill - stopping the cron job`)
          return
        }

        await backfillElectoralZones(addressBatch, logger)

        logger.info(
          `Finished backfilling batch ${i} of ${numBatches} maximum batches of addresses without electoralZone`,
        )
      })

      await step.sleep(
        `script.sleep-backfill-electoral-zones-batch-${i + 1}`,
        BACKFILL_ELECTORAL_ZONES_SLEEP_INTERVAL,
      )

      if (addressBatch.length < BACKFILL_ELECTORAL_ZONES_BATCH_SIZE) break
    }

    logger.info('Finished backfilling all batches for the day, stopping the cron job')
  },
)

async function backfillElectoralZones(
  addressesWithoutElectoralZone: Pick<Address, 'id' | 'formattedDescription' | 'countryCode'>[],
  logger = defaultLogger,
) {
  for (const address of addressesWithoutElectoralZone) {
    let electoralZone: Awaited<ReturnType<typeof maybeGetElectoralZoneFromAddress>> | null = null

    try {
      electoralZone = await maybeGetElectoralZoneFromAddress(address)
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillElectoralZones',
          message: 'error getting electoralZone',
        },
      })
      continue
    }

    if (!electoralZone || 'notFoundReason' in electoralZone) {
      const notFoundReason = electoralZone?.notFoundReason || 'UNEXPECTED_ERROR'
      Sentry.captureMessage(`No electoralZone found for address`, {
        extra: {
          domain: 'backfillElectoralZones',
          notFoundReason,
          address,
        },
      })
      if (
        [
          'NOT_USA_ADDRESS',
          'NOT_SPECIFIC_ENOUGH',
          'ELECTORAL_ZONE_NOT_FOUND',
          'UNEXPECTED_ERROR',
        ].includes(notFoundReason)
      ) {
        logger.info(
          `No electoralZone found for address ${address.id} because ${notFoundReason}. Updating the electoralZone to 0`,
        )

        try {
          await prismaClient.address.update({
            where: {
              id: address.id,
            },
            data: {
              electoralZone: '0',
            },
          })
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              domain: 'backfillElectoralZones',
              message: 'error getting upserting address electoral zone metadata',
            },
          })
        }
      }

      continue
    }

    logger.info(`Created electoralZone ${electoralZone.zoneName} for address ${address.id}`)

    try {
      await prismaClient.address.update({
        where: {
          id: address.id,
        },
        data: {
          electoralZone: electoralZone.zoneName,
        },
      })
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillElectoralZones',
          message: 'error getting upserting address electoral zone metadata',
        },
      })
    }
  }
}
