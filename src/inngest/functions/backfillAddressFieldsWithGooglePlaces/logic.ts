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

import { CONCURRENCY_LIMIT, DEFAULT_MINI_BATCH_SIZE } from './config'

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
    concurrency: CONCURRENCY_LIMIT,
  },
  { event: PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME },
  async ({ event, step, logger }) => {
    const {
      skip,
      take,
      persist,
      countryCode,
      getAddressBatchSize = DEFAULT_MINI_BATCH_SIZE,
    } = event.data

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

    const addressChunks = chunk(addresses, getAddressBatchSize)
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

        try {
          const affectedRows = await prismaClient.$transaction(updatesToPerform)
          logger.info(`UPDATED Updated ${affectedRows.length} addresses in batch ${chunkIndex}`, {
            affectedRows,
          })
          return { affectedRows: affectedRows.length }
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
