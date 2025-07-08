import { Prisma } from '@prisma/client'
import { chunk, isNull } from 'lodash-es'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { getAddressFromGooglePlacePrediction } from '@/utils/server/getAddressFromGooglePlacePrediction'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { DATABASE_UPDATE_CONCURRENCY, MINI_BATCH_SIZE } from './config'

const PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_FUNCTION_ID =
  'script.backfill-address-fields-with-google-places-processor'
const PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME =
  'script/backfill-address-fields-with-google-places-processor'

export interface ProcessAddressFieldsWithGooglePlacesProcessorEventSchema {
  name: typeof PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME
  data: {
    skip: number
    take: number
    persist?: boolean
    countryCode: SupportedCountryCodes
    getAddressBatchSize?: number
  }
}

export const backfillAddressFieldsWithGooglePlacesProcessor = inngest.createFunction(
  {
    id: PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { skip, take, persist, countryCode } = event.data

    if (!persist) {
      logger.info(
        `DRY RUN MODE for batch with skip: ${skip}, take: ${take}. No changes will be written to the database.`,
      )
    }

    const addresses = await step.run('get-addresses', () =>
      prismaClient.address.findMany({
        where: {
          countryCode,
          OR: [
            {
              electoralZone: null,
            },
            {
              administrativeAreaLevel1: '',
            },
          ],
        },
        skip,
        take,
        orderBy: { id: 'asc' },
        select: {
          id: true,
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
      if (chunkIndex > 0) {
        await step.sleep('sleep-between-chunks', 60_000)
      }

      const completeAddressesResults = await step.run(`get-address-for-batch-${chunkIndex}`, () =>
        Promise.allSettled(
          addressChunk.map(address =>
            pRetry(async () => await getAddressFromGooglePlaces(address), {
              retries: 5,
              factor: 2,
              minTimeout: 1000,
              shouldRetry(error) {
                return (
                  !error.message.includes('No place ID found for address') &&
                  !error.message.includes('404') &&
                  !error.message.includes('The provided Place ID is no longer valid') &&
                  !error.message.includes('No place found for address')
                )
              },
            }),
          ),
        ),
      )

      const updatesToPerform = completeAddressesResults
        .map((result, index) => {
          if (result.status === 'fulfilled' && !isNull(result.value)) {
            return prismaClient.address.update({
              where: { id: result.value.addressId },
              data: {
                ...result.value.completeAddress,
                electoralZone: result.value.electoralZone,
              },
            })
          }
          logger.error('Results not found for address', addressChunk[index])
          totalFailed++
          return null
        })
        .filter(Boolean)

      if (!updatesToPerform.length) {
        logger.info(`No updates to perform for batch ${chunkIndex}`)
        continue
      }

      let dbChunkIndex = 0

      let totalSuccessfulUpdates = 0
      let totalFailedUpdates = 0

      const updateChunks = chunk(updatesToPerform, DATABASE_UPDATE_CONCURRENCY)

      for (const updateChunk of updateChunks) {
        if (dbChunkIndex > 0) {
          await step.sleep('sleep-between-db-chunks', 30_000)
        }

        const updateChunkResult = await step.run(
          `update-db-for-batch-${chunkIndex}-chunk-${dbChunkIndex}`,
          async () => {
            const updateRowsResults = await Promise.allSettled(updateChunk)

            const successfulUpdates = updateRowsResults.filter(
              result => result.status === 'fulfilled',
            )
            const failedUpdates = updateRowsResults.filter(result => result.status === 'rejected')

            if (successfulUpdates.length > 0) {
              logger.info(`Updated ${successfulUpdates.length} addresses in batch ${chunkIndex}`)
            }

            if (failedUpdates.length > 0) {
              logger.error(
                `Failed to update ${failedUpdates.length} addresses in batch ${chunkIndex}`,
                {
                  failedUpdates,
                },
              )
            }

            return {
              successfulUpdates: successfulUpdates.length,
              failedUpdates: failedUpdates.length,
            }
          },
        )

        totalSuccessfulUpdates += updateChunkResult.successfulUpdates
        totalFailedUpdates += updateChunkResult.failedUpdates

        dbChunkIndex++
      }

      const successfulUpdatesInChunk = totalSuccessfulUpdates
      totalSuccess += successfulUpdatesInChunk
      totalFailed += totalFailedUpdates

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

async function getAddressFromGooglePlaces(
  address: Prisma.AddressGetPayload<{
    select: {
      id: true
      googlePlaceId: true
      formattedDescription: true
    }
  }>,
) {
  const completeAddress = await getAddressFromGooglePlacePrediction({
    description: address.formattedDescription,
    place_id: address.googlePlaceId ?? undefined,
  })
  let electoralZone: ElectoralZone | undefined
  if (completeAddress.latitude && completeAddress.longitude) {
    electoralZone = await querySWCCivicElectoralZoneFromLatLong(
      completeAddress.latitude,
      completeAddress.longitude,
    )
  }
  return {
    addressId: address.id,
    // Remove null and empty strings
    completeAddress: Object.fromEntries(
      Object.entries(completeAddress).filter(([_, value]) => Boolean(value)),
    ),
    electoralZone: electoralZone?.zoneName,
  }
}
