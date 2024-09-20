import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const defaultLogger = getLogger('cleanPostalCodes')

export async function cleanPostalCodes(persist: boolean, logger = defaultLogger) {
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
