import { Address } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { maybeGetCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_FUNCTION_ID =
  'script.backfill-us-congressional-districts-cron-job'
const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME =
  'script/backfill.us.congressional.districts.cron.job'

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEDULE = '0 1 * * *' //01:00 AM everyday

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL) || 60 * 1000 // 1 minute.
const BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE =
  Number(process.env.BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE) || 1000 // QPM: 1500
const MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT =
  Number(process.env.MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT) || 150000 // QPD: 250000

const logger = getLogger('backfillUsCongressionalDistrictsCronJob')
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
  async ({ step }) => {
    let batchNum = 1

    const addressesWithoutCongressionalDistrictsBatches = await step.run(
      'script.get-addresses',
      async () => {
        const addresses = await prismaClient.address.findMany({
          where: { usCongressionalDistrict: null, countryCode: 'US' },
          take: MAX_US_CONGRESSIONAL_DISTRICTS_BACKFILL_COUNT,
        })
        return chunk(addresses, BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE)
      },
    )

    logger.info(
      `${addressesWithoutCongressionalDistrictsBatches.flat().length} addresses without usCongressionalDistrict found`,
    )

    for (const addressBatch of addressesWithoutCongressionalDistrictsBatches) {
      if (addressBatch.length === 0) {
        logger.info(`No more batches to execute - stopping the cron job`)
        break
      }

      await step.run('scripts.backfill-us-congressional-districts', async () => {
        await backfillUsCongressionalDistricts(addressBatch)

        logger.info(
          `Finished backfilling batch ${batchNum} of ${addressesWithoutCongressionalDistrictsBatches.length} of addresses without usCongressionalDistrict`,
        )
      })

      await step.sleep(
        `script.sleep-${batchNum}`,
        BACKFILL_US_CONGRESSIONAL_DISTRICTS_SLEEP_INTERVAL,
      )

      batchNum += 1
    }

    logger.info('Finished backfilling all batches for the day, stopping the cron job')
  },
)

async function backfillUsCongressionalDistricts(
  addressesWithoutCongressionalDistricts: Omit<Address, 'datetimeCreated' | 'datetimeUpdated'>[],
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
      if (['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(usCongressionalDistrict.notFoundReason)) {
        Sentry.captureMessage(`No usCongressionalDistrict found for address ${address.id}`, {
          extra: {
            domain: 'backfillUsCongressionalDistricts',
            notFoundReason: usCongressionalDistrict.notFoundReason,
          },
        })
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
