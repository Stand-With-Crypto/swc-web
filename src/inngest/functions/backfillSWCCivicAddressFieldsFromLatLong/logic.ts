import { Prisma } from '@prisma/client'
import { chunk, isNull } from 'lodash-es'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { MINI_BATCH_SIZE } from './config'

const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_PROCESSOR_FUNCTION_ID =
  'script.backfill-swc-civic-address-fields-processor'
const BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_PROCESSOR_EVENT_NAME =
  'script/backfill-swc-civic-address-fields-processor'

export interface BackfillSWCCivicAddressFieldsProcessorEventSchema {
  name: typeof BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_PROCESSOR_EVENT_NAME
  data: {
    skip: number
    take: number
    persist?: boolean
    countryCode: SupportedCountryCodes
  }
}

export const backfillSWCCivicAddressFieldsProcessor = inngest.createFunction(
  {
    id: BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_SWC_CIVIC_ADDRESS_FIELDS_PROCESSOR_EVENT_NAME },
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
          OR: [{ electoralZone: null }, { swcCivicAdministrativeArea: null }],
          AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
          countryCode,
        },
        skip,
        take,
        orderBy: { id: 'asc' },
        select: {
          id: true,
          latitude: true,
          longitude: true,
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
              pRetry(async () => await getSWCCivicFieldsToUpdate(address), {
                retries: 3,
                factor: 2,
                minTimeout: 1000,
                maxTimeout: 10000,
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

        const electoralZoneCaseClauses = Prisma.join(
          updatesToPerform.map(
            update => Prisma.sql`WHEN ${update.addressId} THEN ${update.electoralZone}`,
          ),
          ' ',
        )
        const administrativeAreaCaseClauses = Prisma.join(
          updatesToPerform.map(
            update =>
              Prisma.sql`WHEN ${update.addressId} THEN ${update.swcCivicAdministrativeArea}`,
          ),
          ' ',
        )
        const idsToUpdate = Prisma.join(updatesToPerform.map(update => update.addressId))

        try {
          const affectedRows = await prismaClient.$executeRaw`
            UPDATE address
            SET 
              electoral_zone = CASE id ${electoralZoneCaseClauses} END,
              swc_civic_administrative_area = CASE id ${administrativeAreaCaseClauses} END
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

async function getSWCCivicFieldsToUpdate(
  address: Prisma.AddressGetPayload<{
    select: {
      id: true
      latitude: true
      longitude: true
    }
  }>,
) {
  const { latitude, longitude } = address

  if (!latitude || !longitude) {
    return null
  }

  const electoralZone = await querySWCCivicElectoralZoneFromLatLong(
    Number(latitude),
    Number(longitude),
  )

  if (!electoralZone) {
    return null
  }

  return {
    addressId: address.id,
    electoralZone: electoralZone.zoneName,
    swcCivicAdministrativeArea: electoralZone.administrativeArea,
  }
}
