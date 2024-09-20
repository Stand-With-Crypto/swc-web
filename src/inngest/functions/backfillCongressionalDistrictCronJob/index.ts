import { Address } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { maybeGetCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export type BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEMA = {
  name: 'script/backfill.us.congressional.districts.cron.job'
}

const defaultLogger = getLogger('backfillUsCongressionalDistrictsCronJob')

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_FUNCTION_ID =
  'script.backfill-us-congressional-districts-cron-job'
const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME =
  'script/backfill.us.congressional.districts.cron.job'

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEDULE = '0 9 * * *' //everyday 09:00AM UTC or 01:00 AM PST

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL) || 60 * 1000 // 1 minute.
const BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE) || 250 // Our quota is 500 queries per minute
const MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT =
  Number(process.env.MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT) || 150000 // Our quota is 250000 queries per day

export const backfillCongressionalDistrictCronJob = inngest.createFunction(
  {
    id: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEDULE }
      : { event: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    let currentCursor: string | undefined = undefined
    const numBatches = Math.ceil(
      MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT /
        BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE,
    )

    for (let i = 1; i <= numBatches; i++) {
      const addressBatch = await step.run('script.get-addresses', async () => {
        const rowsToTake =
          i * BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE >
          MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT
            ? MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT -
              BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE * (i - 1)
            : BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE

        return await prismaClient.address.findMany({
          select: { id: true, formattedDescription: true, countryCode: true },
          where: { usCongressionalDistrict: null, countryCode: 'US' },
          cursor: currentCursor ? { id: currentCursor } : undefined,
          skip: currentCursor ? 1 : 0,
          take: rowsToTake,
        })
      })

      if (!addressBatch.length) break

      currentCursor = addressBatch[addressBatch.length - 1].id

      await step.run('scripts.backfill-us-congressional-districts', async () => {
        if (!addressBatch.length) {
          logger.info(`No more addresses to backfill - stopping the cron job`)
          return
        }

        await backfillUsCongressionalDistricts(addressBatch, logger)

        logger.info(
          `Finished backfilling batch ${i} of ${numBatches} maximum batches of addresses without usCongressionalDistrict`,
        )
      })

      await step.sleep(
        `script.sleep-backfill-congressional-district-batch-${i + 1}`,
        BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL,
      )

      if (addressBatch.length < BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE) break
    }

    logger.info('Finished backfilling all batches for the day, stopping the cron job')
  },
)

async function backfillUsCongressionalDistricts(
  addressesWithoutCongressionalDistricts: Pick<
    Address,
    'id' | 'formattedDescription' | 'countryCode'
  >[],
  logger = defaultLogger,
) {
  for (const address of addressesWithoutCongressionalDistricts) {
    let usCongressionalDistrict: Awaited<
      ReturnType<typeof maybeGetCongressionalDistrictFromAddress>
    > | null = null

    try {
      usCongressionalDistrict = await maybeGetCongressionalDistrictFromAddress(address)
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillUsCongressionalDistricts',
          message: 'error getting usCongressionalDistrict',
        },
      })
      continue
    }

    if ('notFoundReason' in usCongressionalDistrict) {
      logger.error(
        `Failed to get usCongressionalDistrict for address ${address.id} with code ${usCongressionalDistrict.notFoundReason}`,
      )
      if (usCongressionalDistrict.notFoundReason === 'CIVIC_API_QUOTA_LIMIT_REACHED') {
        break
      }
      if (['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(usCongressionalDistrict.notFoundReason)) {
        Sentry.captureMessage(`No usCongressionalDistrict found for address ${address.id}`, {
          extra: {
            domain: 'backfillUsCongressionalDistricts',
            notFoundReason: usCongressionalDistrict.notFoundReason,
          },
        })
      }
      if (
        [
          'NOT_USA_ADDRESS',
          'NOT_SAME_STATE',
          'NOT_SPECIFIC_ENOUGH',
          'CIVIC_API_BAD_REQUEST',
        ].includes(usCongressionalDistrict.notFoundReason)
      ) {
        logger.info(
          `No usCongressionalDistrict found for address ${address.id} because ${usCongressionalDistrict.notFoundReason}. Updating the usCongressionalDistrict to 0`,
        )

        try {
          await prismaClient.address.update({
            where: {
              id: address.id,
            },
            data: {
              usCongressionalDistrict: '0',
            },
          })
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              domain: 'backfillUsCongressionalDistricts',
              message: 'error getting upserting address congressional district metadata',
            },
          })
        }
      }

      continue
    }

    logger.info(
      `Created usCongressionalDistrict ${usCongressionalDistrict.districtNumber} for address ${address.id}`,
    )

    try {
      await prismaClient.address.update({
        where: {
          id: address.id,
        },
        data: {
          usCongressionalDistrict: `${usCongressionalDistrict.districtNumber}`,
        },
      })
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillUsCongressionalDistricts',
          message: 'error getting upserting address congressional district metadata',
        },
      })
    }
  }
}
