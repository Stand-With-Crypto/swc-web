import { Address, Prisma } from '@prisma/client'
import { chunk, isNull } from 'lodash-es'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { getAddressFromGooglePlacePrediction } from '@/utils/server/getAddressFromGooglePlacePrediction'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { MINI_BATCH_SIZE } from './config'

const PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_FUNCTION_ID =
  'script.backfill-address-fields-with-google-places-processor'
const PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME =
  'script/backfill-address-fields-with-google-places-processor'

export interface ProcessAddressFieldsWithGooglePlacesProcessorEventSchema {
  name: typeof PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME
  data: {
    lastProcessedId?: string
    take: number
    persist?: boolean
    countryCode: SupportedCountryCodes
  }
}

export interface ProcessorResult {
  totalSuccess: number
  totalFailed: number
  lastProcessedId?: string
}

export const backfillAddressFieldsWithGooglePlacesProcessor = inngest.createFunction(
  {
    id: PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: PROCESS_ADDRESS_FIELDS_WITH_GOOGLE_PLACES_PROCESSOR_EVENT_NAME },
  async ({ event, step, logger }): Promise<ProcessorResult> => {
    const { lastProcessedId, take, persist, countryCode } = event.data

    if (!persist) {
      logger.info(
        `DRY RUN MODE for batch with lastProcessedId: ${lastProcessedId}, take: ${take}. No changes will be written to the database.`,
      )
    }

    const addresses = await step.run('get-addresses', () =>
      prismaClient.address.findMany({
        where: {
          countryCode,
          ...(lastProcessedId && {
            id: {
              gte: lastProcessedId,
            },
          }),
          OR: [
            {
              electoralZone: null,
            },
            {
              administrativeAreaLevel1: '',
            },
          ],
        },
        take,
        select: {
          id: true,
          formattedDescription: true,
          googlePlaceId: true,
          electoralZone: true,
          streetNumber: true,
          route: true,
          locality: true,
          administrativeAreaLevel1: true,
          administrativeAreaLevel2: true,
          countryCode: true,
          postalCode: true,
          postalCodeSuffix: true,
          latitude: true,
          longitude: true,
          subpremise: true,
        },
        orderBy: { id: 'asc' },
      }),
    )

    if (addresses.length === 0) {
      logger.info('No Addresses to process')
      return {
        totalSuccess: 0,
        totalFailed: 0,
      }
    }

    const addressChunks = chunk(addresses, MINI_BATCH_SIZE)
    let chunkIndex = 0
    let totalSuccess = 0
    let totalFailed = 0
    let currentLastProcessedId = lastProcessedId || addresses[0]?.id

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
            const existingAddress = addressChunk[index]
            const { id, ...existingAddressWithoutId } = existingAddress

            return {
              addressId: id,
              existingGooglePlaceId: existingAddress.googlePlaceId, // Store original DB value
              updateData: {
                ...existingAddressWithoutId,
                ...result.value.completeAddress,
                electoralZone: result.value.electoralZone || existingAddress.electoralZone,
              } as Record<keyof Address, string | number | null>,
            }
          }
          logger.error('Results not found for address', addressChunk[index])
          totalFailed++
          return null
        })
        .filter(Boolean)

      if (!updatesToPerform.length) {
        logger.info(`No updates to perform for batch ${chunkIndex}`)
      } else {
        const chunkUpdateResult = await step.run(
          `update-addresses-batch-${chunkIndex}`,
          async () => {
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
              const allFields = new Set<keyof Address>()
              updatesToPerform.forEach(update => {
                Object.keys(update.updateData).forEach(field =>
                  allFields.add(field as keyof Address),
                )
              })

              const fieldMapping: Partial<Record<keyof Address, string>> = {
                electoralZone: 'electoral_zone',
                streetNumber: 'street_number',
                route: 'route',
                locality: 'locality',
                administrativeAreaLevel1: 'administrative_area_level_1',
                administrativeAreaLevel2: 'administrative_area_level_2',
                countryCode: 'country_code',
                postalCode: 'postal_code',
                postalCodeSuffix: 'postal_code_suffix',
                latitude: 'latitude',
                longitude: 'longitude',
                formattedDescription: 'formatted_description',
                googlePlaceId: 'google_place_id',
                subpremise: 'subpremise',
              }

              // Check for duplicate googlePlaceIds within this batch to avoid constraint violations
              const googlePlaceIdCounts = new Map<string, number>()
              updatesToPerform.forEach(update => {
                const placeId = String(update.updateData.googlePlaceId)
                if (placeId) {
                  googlePlaceIdCounts.set(placeId, (googlePlaceIdCounts.get(placeId) || 0) + 1)
                }
              })

              const batchDuplicatePlaceIds = Array.from(googlePlaceIdCounts.entries())
                .filter(([_, count]) => count > 1)
                .map(([placeId, _]) => placeId)

              if (batchDuplicatePlaceIds.length > 0) {
                logger.warn(
                  `Found ${batchDuplicatePlaceIds.length} duplicate googlePlaceIds within batch ${chunkIndex}. These will be skipped to avoid constraint violations.`,
                  { batchDuplicatePlaceIds },
                )

                // Restore existing googlePlaceId for batch duplicates to avoid batch failure
                updatesToPerform.forEach(update => {
                  const placeId = String(update.updateData.googlePlaceId)
                  if (placeId && batchDuplicatePlaceIds.includes(placeId)) {
                    update.updateData.googlePlaceId = update.existingGooglePlaceId
                    logger.debug(
                      `Restored existing googlePlaceId (${update.existingGooglePlaceId ?? 'null'}) for address ${update.addressId} to prevent batch duplicate`,
                    )
                  }
                })
              }

              // Check for existing googlePlaceIds in database to avoid constraint violations
              const newGooglePlaceIds = updatesToPerform
                .map(update => String(update.updateData.googlePlaceId))
                .filter(Boolean)

              if (newGooglePlaceIds.length > 0) {
                const existingAddresses = await prismaClient.address.findMany({
                  where: {
                    googlePlaceId: { in: newGooglePlaceIds },
                    id: { notIn: updatesToPerform.map(u => u.addressId) }, // Exclude current addresses being updated
                  },
                  select: { googlePlaceId: true },
                })

                const existingPlaceIds = new Set(existingAddresses.map(addr => addr.googlePlaceId))

                if (existingPlaceIds.size > 0) {
                  logger.warn(
                    `Found ${existingPlaceIds.size} googlePlaceIds that already exist in database. These will be skipped to avoid constraint violations.`,
                    { existingPlaceIds: Array.from(existingPlaceIds) },
                  )

                  // Restore existing googlePlaceId for existing ones to avoid batch failure
                  updatesToPerform.forEach(update => {
                    const placeId = String(update.updateData.googlePlaceId)
                    if (placeId && existingPlaceIds.has(placeId)) {
                      update.updateData.googlePlaceId = update.existingGooglePlaceId
                      logger.debug(
                        `Restored existing googlePlaceId (${update.existingGooglePlaceId ?? 'null'}) for address ${update.addressId} to prevent database constraint violation`,
                      )
                    }
                  })
                }
              }

              const setClauses: Prisma.Sql[] = []

              for (const field of allFields) {
                const columnName = fieldMapping[field]
                if (!columnName) {
                  logger.warn(`Unknown field '${field}' - skipping update for this field`)
                  continue
                }

                const caseClauses = Prisma.join(
                  updatesToPerform.map(update => {
                    const value = update.updateData[field]
                    return Prisma.sql`WHEN ${update.addressId} THEN ${value}`
                  }),
                  ' ',
                )

                setClauses.push(Prisma.sql`${Prisma.raw(columnName)} = CASE id ${caseClauses} END`)
              }

              setClauses.push(Prisma.sql`datetime_updated = NOW()`)

              if (setClauses.length === 0) {
                logger.info(`No valid fields to update for batch ${chunkIndex}`)
                return { affectedRows: 0 }
              }

              const idsToUpdate = Prisma.join(updatesToPerform.map(update => update.addressId))
              const setClause = Prisma.join(setClauses, ', ')

              logger.info(
                `Batch ${chunkIndex}: Processing ${updatesToPerform.length} addresses with ${allFields.size} fields`,
              )

              const affectedRows = await prismaClient.$executeRaw`
              UPDATE address
              SET ${setClause}
              WHERE id IN (${idsToUpdate})
            `
              logger.info(`Updated ${affectedRows} addresses in batch ${chunkIndex}`)
              return { affectedRows }
            } catch (error) {
              logger.error(`Raw SQL update failed for batch ${chunkIndex}`, { error })
              return { affectedRows: 0 }
            }
          },
        )

        const successfulUpdatesInChunk = chunkUpdateResult.affectedRows
        const failedUpdatesInChunk = updatesToPerform.length - successfulUpdatesInChunk
        totalSuccess += successfulUpdatesInChunk
        totalFailed += failedUpdatesInChunk

        logger.info(
          `${!persist ? '[DRY RUN] ' : ''}Processed ${
            successfulUpdatesInChunk
          }/${updatesToPerform.length} addresses in batch ${chunkIndex}.`,
        )
      }

      // Update the cursor to the last ID processed in this chunk (addresses are ordered by id ASC)
      if (addressChunk.length > 0) {
        currentLastProcessedId = addressChunk[addressChunk.length - 1].id
      }

      chunkIndex++
    }

    logger.info(
      `${!persist ? '[DRY RUN] ' : ''}Finished processing batch with lastProcessedId: ${lastProcessedId}.
			Total addresses successfully updated: ${totalSuccess}.
			Total addresses failed to update: ${totalFailed}.
			Total addresses processed: ${addresses.length}.
			Final lastProcessedId: ${currentLastProcessedId}.`,
    )

    return {
      totalSuccess,
      totalFailed,
      lastProcessedId: currentLastProcessedId,
    }
  },
)

async function getAddressFromGooglePlaces(
  address: Pick<Address, 'id' | 'formattedDescription' | 'googlePlaceId'>,
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
