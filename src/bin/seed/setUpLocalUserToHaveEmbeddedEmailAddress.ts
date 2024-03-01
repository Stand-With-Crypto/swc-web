import 'dotenv/config'

import { faker } from '@faker-js/faker'
import { DataCreationMethod } from '@prisma/client'

import { runBin } from '@/bin/runBin'
import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const LOCAL_USER_CRYPTO_ADDRESS = parseThirdwebAddress(
  requiredEnv(process.env.LOCAL_USER_CRYPTO_ADDRESS, 'process.env.LOCAL_USER_CRYPTO_ADDRESS'),
)

const LOCAL_USER_EMAIL_ADDRESS = requiredEnv(
  process.env.LOCAL_USER_EMAIL_ADDRESS,
  'process.env.LOCAL_USER_EMAIL_ADDRESS',
)

const logger = getLogger('setUpLocalUserToHaveEmbeddedEmailAddress')
async function setUpLocalUserToHaveEmbeddedEmailAddress() {
  // make sure the db has no record of the local user
  const userCryptoAddress = await prismaClient.userCryptoAddress.findMany({
    where: {
      cryptoAddress: LOCAL_USER_CRYPTO_ADDRESS,
    },
  })
  logger.info(`changing ${userCryptoAddress.length} crypto addresses to be different`)
  for (const address of userCryptoAddress) {
    await prismaClient.userCryptoAddress.update({
      where: {
        id: address.id,
      },
      data: {
        cryptoAddress: parseThirdwebAddress(faker.finance.ethereumAddress()),
      },
    })
  }
  const userEmailAddress = await prismaClient.userEmailAddress.findMany({
    where: {
      emailAddress: LOCAL_USER_CRYPTO_ADDRESS,
    },
  })
  logger.info(`changing ${userEmailAddress.length} email addresses to be different`)
  for (const address of userEmailAddress) {
    await prismaClient.userEmailAddress.update({
      where: {
        id: address.id,
      },
      data: {
        emailAddress: faker.internet.email(),
      },
    })
  }
  await prismaClient.user.create({
    data: {
      ...mockCreateUserInput(),
      userCryptoAddresses: {
        create: {
          ...mockCreateUserCryptoAddressInput(),
          cryptoAddress: LOCAL_USER_CRYPTO_ADDRESS,
          dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          hasBeenVerifiedViaAuth: false,
        },
      },
      userEmailAddresses: {
        create: {
          ...mockCreateUserEmailAddressInput(),
          emailAddress: LOCAL_USER_EMAIL_ADDRESS,
          dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          isVerified: false,
        },
      },
    },
  })
}

void runBin(setUpLocalUserToHaveEmbeddedEmailAddress)
