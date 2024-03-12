import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('setPrimaryCryptoAddressOfUser')

export async function setPrimaryCryptoAddressOfUser(
  userId: string | undefined,
  cryptoAddressId: string | undefined,
  persist: boolean,
) {
  if (userId === undefined) {
    throw new Error('userId cannot be undefined')
  }
  if (cryptoAddressId === undefined) {
    throw new Error('cryptoAddressId cannot be undefined')
  }

  const user = await prismaClient.user.findFirst({ where: { id: userId } })

  if (user === null) {
    throw new Error('No user found')
  }

  logger.info('addressId ' + cryptoAddressId)
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
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      primaryUserCryptoAddressId: cryptoAddressId,
    },
  })
}
