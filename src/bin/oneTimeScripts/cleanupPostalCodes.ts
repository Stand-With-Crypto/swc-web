import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const params = yargs(hideBin(process.argv)).option('persist', {
  type: 'boolean',
})

const logger = getLogger('cleanPostalCodes')

export async function cleanupPostalCodes(persist: boolean) {
  const postalCodesWithSuffix = await prismaClient.address.findMany({
    where: {
      postalCode: {
        contains: '-',
      },
    },
  })

  logger.info(
    `Found ${postalCodesWithSuffix.length} addresses with postal code containing postal code suffix`,
  )

  if (!persist) {
    logger.info('Dry run, exiting')
    return { found: postalCodesWithSuffix.length, updated: 0 }
  }

  const sql = `
  UPDATE  address
  SET postal_code_suffix=   SUBSTRING_INDEX(address.postal_code, '-', -1),
      postal_code=SUBSTRING_INDEX(address.postal_code, '-', 1)
  WHERE postal_code LIKE '%-%';
  `

  const affectedRows = await prismaClient.$executeRawUnsafe(sql)
  return { found: postalCodesWithSuffix.length, updated: affectedRows }
}

async function runCleanupPostalCodes() {
  const { persist } = await params.argv
  logger.info(`started with persist=${persist as any}`)
  const result = await cleanupPostalCodes(persist ? persist : false)
  logger.info(`updated ${result.updated} postal codes`)
  return result
}

void runBin(runCleanupPostalCodes)
