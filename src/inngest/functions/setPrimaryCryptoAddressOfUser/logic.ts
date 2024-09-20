import { boolean, object, string, z } from 'zod'

import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const defaultLogger = getLogger('setPrimaryCryptoAddressOfUser')

const zodPrimaryCryptoAddressOfUserParameters = object({
  userId: string(),
  cryptoAddressId: string(),
  persist: boolean(),
})

export async function setPrimaryCryptoAddressOfUser(
  parameters: z.infer<typeof zodPrimaryCryptoAddressOfUserParameters>,
  logger = defaultLogger,
) {
  zodPrimaryCryptoAddressOfUserParameters.parse(parameters)
  const { userId, cryptoAddressId, persist } = parameters

  logger.info(`userId:${userId} - cryptoAddressId: ${cryptoAddressId} `)
  const user = await prismaClient.user.findFirst({ where: { id: userId } })
  if (user === null) {
    throw new Error('No user found')
  }

  const cryptoAddress = await prismaClient.userCryptoAddress.findFirst({
    where: { id: cryptoAddressId, userId: userId },
  })
  if (cryptoAddress === null) {
    throw new Error("Crypto address not found or doesn't belong to user")
  }

  const userWithAddress = await prismaClient.user.findFirst({
    where: { primaryUserCryptoAddressId: cryptoAddressId, id: { not: userId } },
  })
  if (userWithAddress !== null) {
    throw new Error('a user with the same primaryUserCryptoAddressId already exist')
  }
  if (!persist) {
    logger.info('Dry run, exiting')
    return
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      primaryUserCryptoAddressId: cryptoAddressId,
    },
  })
}
