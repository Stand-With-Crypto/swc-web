import { Address } from '@prisma/client'
import fs from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { getCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getLogger } from '@/utils/shared/logger'

const params = yargs(hideBin(process.argv)).option('persist', {
  type: 'boolean',
})

const logger = getLogger('backfillMissingUsCongressionalDistricts')

const ZipCodeToDistrictNumber = JSON.parse(
  fs.readFileSync('src/bin/CongressionalDistrict.json', 'utf8'),
) as Record<string, string>

const GOOGLE_CIVIC_API_LIMIT = 1000
let GOOGLE_CIVIC_API_CALLS = 0

async function backfillMissingUsCongressionalDistricts() {
  const { persist } = await params.argv

  const addressesWithoutCongressionalDistricts = await prismaClient.address.findMany({
    where: { usCongressionalDistrict: null },
  })
  logger.info(
    `Found ${addressesWithoutCongressionalDistricts.length} addresses without usCongressionalDistrict`,
  )
  if (!persist) {
    logger.info(`persist=${persist as any}, not persisting changes`)
    return
  }
  for (const address of addressesWithoutCongressionalDistricts) {
    const usCongressionalDistrictNumber = await getUsCongressionalDistrict(address)

    if (!usCongressionalDistrictNumber) {
      continue
    }

    logger.info(
      `Created usCongressionalDistrict ${usCongressionalDistrictNumber} for address ${address.id}`,
    )

    await prismaClient.address.update({
      where: {
        id: address.id,
      },
      data: {
        usCongressionalDistrict: `${usCongressionalDistrictNumber}`,
      },
    })
  }
}

const getUsCongressionalDistrict = async (address: Address) => {
  if (address.postalCode in ZipCodeToDistrictNumber) {
    return ZipCodeToDistrictNumber[address.postalCode]
  }
  if (GOOGLE_CIVIC_API_CALLS >= GOOGLE_CIVIC_API_LIMIT) {
    logger.warn(`Google Civic API daily limit reached, address ${address.id} skipped`)
    return null
  }

  const usCongressionalDistrict = await getCongressionalDistrictFromAddress(
    address.formattedDescription,
  ).catch(() => null)
  GOOGLE_CIVIC_API_CALLS += 1

  if (!usCongressionalDistrict || 'notFoundReason' in usCongressionalDistrict) {
    logger.warn(`No usCongressionalDistrict found for address ${address.id}`)
    return null
  }

  return `${usCongressionalDistrict.districtNumber}`
}

void runBin(backfillMissingUsCongressionalDistricts)
