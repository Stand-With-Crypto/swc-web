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
        break
      }

      /**
       * Further chunk the mini-batches into smaller batches to prevent overwhelming the database.
       */
      const addressChunks = chunk(addresses, SUB_BATCH_SIZE)
      for (const addressChunk of addressChunks) {
        const settlementResults = await step.run(
          `process-addresses-batch-${i}-${totalProcessed}`,
          async () => {
            const promises = addressChunk.map(async address => {
              let electoralZone: string | null = null
              if (
                address.usCongressionalDistrict &&
                address.countryCode === SupportedCountryCodes.US
              ) {
                electoralZone = address.usCongressionalDistrict
              } else {
                try {
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
                      electoralZone = swcCivicElectoralZone.zoneName
                    }
                  }
                } catch (error) {
                  logger.error(`error fetching electoral zone for address ${address.id}`, { error })
                  totalFailed++
                }
              }

              if (electoralZone) {
                if (persist) {
                  return prismaClient.address.update({
                    where: { id: address.id },
                    data: { electoralZone },
                  })
                }
                logger.info(
                  `[DRY RUN] Would update address ${address.id} with electoralZone: ${electoralZone}`,
                )
                return { addressId: address.id, electoralZone }
              }
            })
            return Promise.allSettled(promises)
          },
        )

        const processedInBatch = settlementResults.filter(
          result => result.status === 'fulfilled' && result.value,
        ).length
        totalProcessed += processedInBatch

        settlementResults.forEach(result => {
          if (result.status === 'rejected') {
            logger.error('Failed to update address electoral zone', { error: result.reason })
            totalFailed++
          }
        })

        logger.info(
          `${!persist ? '[DRY RUN] ' : ''}Processed ${processedInBatch}/${addressChunk.length} addresses in sub-batch.`,
        )

        await step.sleep(`sleep-after-sub-batch-${i}-${totalProcessed}`, SLEEP_DURATION)
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
