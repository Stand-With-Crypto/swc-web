import { Prisma } from '@prisma/client'
import { chunk, isNull } from 'lodash-es'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

import { CONCURRENCY_LIMIT, MINI_BATCH_SIZE } from './config'

const PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_FUNCTION_ID =
  'script.backfill-address-electoral-zone-processor'
const PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_EVENT_NAME =
  'script/backfill-address-electoral-zone-processor'

export interface ProcessAddressElectoralZoneProcessorEventSchema {
  name: typeof PROCESS_ADDRESS_ELECTORAL_ZONE_PROCESSOR_EVENT_NAME
  data: {
    skip: number
    take: number
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
    const { skip, take, persist } = event.data

    if (!persist) {
      logger.info(
        `DRY RUN MODE for batch with skip: ${skip}, take: ${take}. No changes will be written to the database.`,
      )
    }

    const addresses = await step.run('get-addresses', () =>
      prismaClient.address.findMany({
        where: { electoralZone: null },
        skip,
        take,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          usCongressionalDistrict: true,
          countryCode: true,
          googlePlaceId: true,
          formattedDescription: true,
        },
      }),
    )

    if (addresses.length === 0) {
      logger.info('No Addresses to process')
      return {
        totalProcessed: 0,
        totalFailed: 0,
      }
    }

    const addressChunks = chunk(addresses, MINI_BATCH_SIZE)
    let chunkIndex = 0
    let totalSuccess = 0
    let totalFailed = 0
    for (const addressChunk of addressChunks) {
      const electoralZoneResults = await step.run(
        `get-electoral-zones-for-batch-${chunkIndex}`,
        async () =>
          await Promise.allSettled(
            addressChunk.map(address =>
              pRetry(async () => await getElectoralZone(address), {
                shouldRetry(error) {
                  return (
                    !error.message.includes('No place ID found for address') &&
                    !error.message.includes('404') &&
                    !error.message.includes('The provided Place ID is no longer valid')
                  )
                },
              }),
            ),
          ),
      )

      const updatesToPerform = electoralZoneResults
        .map((result, index) => {
          if (result.status === 'fulfilled' && !isNull(result.value)) {
            return result.value
          }
          logger.error('Electoral zone not found for address', addressChunk[index])
          totalFailed++
          return null
        })
        .filter(Boolean)

      if (!updatesToPerform.length) {
        logger.info(`No updates to perform for batch ${chunkIndex}`)
        continue
      }

      const chunkUpdateResults = await step.run(`update-db-for-batch-${chunkIndex}`, async () => {
        if (!persist) {
          logger.info(
            `[DRY RUN] Would update ${updatesToPerform.length} addresses in batch ${chunkIndex}.`,
          )
          return { affectedRows: updatesToPerform.length }
        }

        if (updatesToPerform.length === 0) {
          return { affectedRows: 0 }
        }

        const caseClauses = Prisma.join(
          updatesToPerform.map(
            update => Prisma.sql`WHEN ${update.addressId} THEN ${update.electoralZone}`,
          ),
          ' ',
        )
        const idsToUpdate = Prisma.join(updatesToPerform.map(update => update.addressId))

        try {
          const affectedRows = await prismaClient.$executeRaw`
            UPDATE address
            SET electoral_zone = CASE id ${caseClauses} END
            WHERE id IN (${idsToUpdate})
          `
          logger.info(`UPDATED Updated ${affectedRows} addresses in batch ${chunkIndex}`)
          return { affectedRows }
        } catch (error) {
          logger.error(`Raw SQL update failed for batch ${chunkIndex}`, { error })
          return { affectedRows: 0 }
        }
      })

      const successfulUpdatesInChunk = chunkUpdateResults.affectedRows
      const failedUpdatesInChunk = updatesToPerform.length - successfulUpdatesInChunk
      totalSuccess += successfulUpdatesInChunk
      totalFailed += failedUpdatesInChunk

      logger.info(
        `${!persist ? '[DRY RUN] ' : ''}Processed ${
          successfulUpdatesInChunk
        }/${updatesToPerform.length} addresses in batch ${chunkIndex}.`,
      )
      chunkIndex++
    }

    logger.info(
      `${!persist ? '[DRY RUN] ' : ''}Finished processing batch with skip: ${skip}.
			Total addresses successfully updated: ${totalSuccess}.
			Total addresses failed to update: ${totalFailed}.
			Total addresses processed: ${addresses.length}.`,
    )
    return {
      totalSuccess,
      totalFailed,
    }
  },
)

async function getElectoralZone(
  address: Prisma.AddressGetPayload<{
    select: {
      id: true
      usCongressionalDistrict: true
      countryCode: true
      googlePlaceId: true
      formattedDescription: true
    }
  }>,
) {
  if (address.usCongressionalDistrict) {
    return { addressId: address.id, electoralZone: address.usCongressionalDistrict }
  }
  return null
}
