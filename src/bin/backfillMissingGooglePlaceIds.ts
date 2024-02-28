import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const params = yargs(hideBin(process.argv)).option('persist', {
  type: 'boolean',
})

const logger = getLogger('backfillMissingGooglePlaceIds')

async function backfillMissingGooglePlaceIds() {
  const { persist } = await params.argv
  const addressesWithoutGooglePlaceIds = await prismaClient.address.findMany({
    where: { googlePlaceId: null },
  })
  logger.info(`Found ${addressesWithoutGooglePlaceIds.length} addresses without googlePlaceIds`)
  if (!persist) {
    logger.info(`persist=${persist as any}, not persisting changes`)
    return
  }
  for (const address of addressesWithoutGooglePlaceIds) {
    const placeId = await getGooglePlaceIdFromAddress(address.formattedDescription).catch(
      () => null,
    )
    if (!placeId) {
      logger.warn(`No placeId found for address ${address.id}`)
      continue
    }
    logger.info(`Created googlePlaceId ${placeId} for address ${address.id}`)
    await prismaClient.address.update({
      where: {
        id: address.id,
      },
      data: {
        googlePlaceId: placeId,
      },
    })
  }
}

void runBin(backfillMissingGooglePlaceIds)
