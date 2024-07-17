import { Address } from '@prisma/client'
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

const BACKFILL_US_CONGRESSIONAL_DISTRICTS_MINI_BATCH_SIZE = 100
const BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE = 2000
const BATCH_BUFFER = 1.15

const MAX_BACKFILL_COUNT = 1000

const logger = getLogger('backfillUsCongressionalDistrictsCronJob')
export const backfillCongressionalDistrictCronJob = inngest.createFunction(
  {
    id: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_SCHEDULE }
      : { event: BACKFILL_US_CONGRESSIONAL_DISTRICTS_INNGEST_CRON_JOB_EVENT_NAME }),
  },
  async ({ step }) => {
    const addressesWithoutCongressionalDistrictsBatches = await step.run(
      'script.get-addresses',
      async () => {
        const numMiniBatches =
          Math.ceil(
            BACKFILL_US_CONGRESSIONAL_DISTRICTS_BATCH_SIZE /
              BACKFILL_US_CONGRESSIONAL_DISTRICTS_MINI_BATCH_SIZE,
          ) * BATCH_BUFFER

        const addresses = await prismaClient.address.findMany({
          where: { usCongressionalDistrict: null },
          take: MAX_BACKFILL_COUNT,
        })
        logger.info(`Found ${addresses.length} addresses without usCongressionalDistrict`)
        return chunk(addresses, numMiniBatches)
      },
    )

    for (const addressBatch of addressesWithoutCongressionalDistrictsBatches) {
      if (addressBatch.length === 0) {
        logger.info(`No more batches to execute - stopping the cron job`)
        break
      }

      await step.run('scripts.backfill-us-congressional-districts', async () => {
        await backfillUsCongressionalDistricts(addressBatch)

        logger.info('Finished backfilling usCongressionalDistricts')
      })
    }
  },
)

async function backfillUsCongressionalDistricts(
  addressesWithoutCongressionalDistricts: Omit<Address, 'datetimeCreated' | 'datetimeUpdated'>[],
) {
  for (const address of addressesWithoutCongressionalDistricts) {
    const usCongressionalDistrict = await maybeGetCongressionalDistrictFromAddress(address)

    if ('notFoundReason' in usCongressionalDistrict) {
      logger.error(
        `Failed to get usCongressionalDistrict for address ${address.id} with code ${usCongressionalDistrict.notFoundReason}`,
      )
      continue
    }

    logger.info(
      `Created usCongressionalDistrict ${usCongressionalDistrict.districtNumber} for address ${address.id}`,
    )

    await prismaClient.address.update({
      where: {
        id: address.id,
      },
      data: {
        usCongressionalDistrict: `${usCongressionalDistrict.districtNumber}`,
      },
    })
  }
}
