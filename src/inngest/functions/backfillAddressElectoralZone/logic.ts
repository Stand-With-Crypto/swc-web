import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import {
  BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE,
  CONCURRENCY_LIMIT,
  MINI_BATCH_SIZE,
  SLEEP_DURATION,
  SUB_BATCH_SIZE,
} from './config'

const PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_FUNCTION_ID =
  'script.backfill-address-electoral-zone-processor'
const PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_EVENT_NAME =
  'script/backfill-address-electoral-zone-processor'

export interface ProcessAddressElectoralZoneProcessorEventSchema {
  name: typeof PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_EVENT_NAME
  data: {
    addressCursor: string
    persist?: boolean
  }
}

export const backfillAddressElectoralZoneProcessor = inngest.createFunction(
  {
    id: PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
    concurrency: CONCURRENCY_LIMIT,
  },
  { event: PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { addressCursor, persist } = event.data
    if (!addressCursor) {
      throw new NonRetriableError('missing address cursor in event data')
    }

    if (!persist) {
      logger.info(
        `DRY RUN MODE for batch with cursor ${addressCursor}. No changes will be written to the database.`,
      )
    }

    const numMiniBatches = Math.ceil(BACKFILL_ADDRESS_ELECTORAL_ZONE_BATCH_SIZE / MINI_BATCH_SIZE)
    let totalProcessed = 0
    let totalFailed = 0

    for (let i = 0; i < numMiniBatches; i++) {
      const addresses = await step.run(`get-addresses-batch-${i}`, () =>
        prismaClient.address.findMany({
          where: { electoralZone: null },
          cursor: { id: addressCursor },
          skip: i * MINI_BATCH_SIZE,
          take: MINI_BATCH_SIZE,
          orderBy: { id: 'asc' },
        }),
      )

      if (addresses.length === 0) {
        logger.info(`No addresses found to process for batch ${i}.`)
        break
      }

      /**
       * Further chunk the mini-batches into smaller batches to prevent overwhelming the database.
       */
      const addressChunks = chunk(addresses, SUB_BATCH_SIZE)
      let chunkIndex = 0
      for (const addressChunk of addressChunks) {
        const electoralZoneResults = await step.run(
          `get-electoral-zones-for-batch-${i}-${chunkIndex}`,
          async () => {
            const promises = addressChunk.map(async address => {
              if (
                address.usCongressionalDistrict &&
                address.countryCode === SupportedCountryCodes.US
              ) {
                return { addressId: address.id, electoralZone: address.usCongressionalDistrict }
              }

              if (address.googlePlaceId || address.formattedDescription) {
                const location = await getLatLongFromAddressOrPlaceId({
                  address: address.formattedDescription,
                  placeId: address.googlePlaceId || undefined,
                })
                const swcCivicElectoralZone = await querySWCCivicElectoralZoneFromLatLong(
                  location.latitude,
                  location.longitude,
                )
                if (swcCivicElectoralZone) {
                  return {
                    addressId: address.id,
                    electoralZone: swcCivicElectoralZone.zoneName,
                  }
                }
              }

              return null
            })
            return Promise.allSettled(promises)
          },
        )

        const updatesToPerform: { addressId: string; electoralZone: string }[] = []
        electoralZoneResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            updatesToPerform.push(result.value)
          } else if (result.status === 'rejected') {
            logger.error(`error fetching electoral zone for address ${addressChunk[index].id}`, {
              error: result.reason,
            })
            totalFailed++
          }
        })

        if (persist) {
          if (!updatesToPerform.length) {
            logger.info(`No updates to perform for batch ${i}-${chunkIndex}`)
            continue
          }
          try {
            await step.run(`update-db-for-batch-${i}-${chunkIndex}`, async () => {
              await prismaClient.$transaction(async prisma => {
                const updatePromises = updatesToPerform.map(({ addressId, electoralZone }) =>
                  prisma.address.update({
                    where: { id: addressId },
                    data: { electoralZone },
                  }),
                )
                const results = await Promise.allSettled(updatePromises)
                results.forEach(result => {
                  if (result.status === 'fulfilled') {
                    totalProcessed++
                  } else {
                    logger.error('Failed to update address in database transaction', {
                      error: result.reason,
                    })
                    totalFailed++
                  }
                })
              })
            })
          } catch (error) {
            logger.error('Database transaction failed entirely', { error })
            totalFailed += updatesToPerform.length
          }
        } else {
          updatesToPerform.forEach(({ addressId, electoralZone }) => {
            logger.info(
              `[DRY RUN] Would update address ${addressId} with electoralZone: ${electoralZone}`,
            )
          })
          totalProcessed += updatesToPerform.length
        }

        logger.info(
          `${!persist ? '[DRY RUN] ' : ''}Processed ${updatesToPerform.length}/${addressChunk.length} addresses in sub-batch.`,
        )
        chunkIndex++
        await step.sleep(`sleep-after-sub-batch-${i}-${chunkIndex}`, SLEEP_DURATION)
      }
    }

    logger.info(
      `${!persist ? '[DRY RUN] ' : ''}Finished processing batch from cursor ${addressCursor}. Total processed: ${totalProcessed}. Total failed: ${totalFailed}.`,
    )
    return {
      totalProcessed,
      totalFailed,
    }
  },
)
