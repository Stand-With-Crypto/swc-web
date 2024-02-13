import { DataCreationMethod } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, TestCase, verify } from './utils'

export const testCaseUserHasLegacyMigrationCryptoAddressAndLogsOnViaSameCryptoAddress: TestCase = {
  name: 'User Has Legacy Migration Crypto Address And Logs On Via Same Crypto Address',
  parameters: async () => {
    const existingUser = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userCryptoAddresses: {
          create: {
            ...mockCreateUserCryptoAddressInput(),
            hasBeenVerifiedViaAuth: false,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
        userSessions: {
          create: {},
        },
      },
      include: {
        userEmailAddresses: true,
        userCryptoAddresses: true,
        userSessions: true,
      },
    })
    await prismaClient.user.update({
      where: { id: existingUser.id },
      data: {
        primaryUserCryptoAddressId: existingUser.userCryptoAddresses[0].id,
      },
    })
    return {
      ...getDefaultParameters(),
      cryptoAddress: existingUser.userCryptoAddresses[0].cryptoAddress,
    }
  },
  validateResults: (
    {
      existingUsersWithSource,
      embeddedWalletEmailAddress,
      merge,
      wasUserCreated,
      maybeUpsertCryptoAddressResult,
      maybeUpsertEmbeddedWalletEmailAddressResult,
      didCapitalCanaryUpsert,
      postLoginUserActionSteps,
    },
    issues,
  ) => {
    // changed
    verify(existingUsersWithSource.length, true, 'existingUsersWithSource.length', issues)
    verify(embeddedWalletEmailAddress, false, 'embeddedWalletEmailAddress', issues)
    verify(merge?.usersToDelete.length, false, 'merge?.usersToDelete.length', issues)
    // changed
    verify(merge?.userToKeep, true, 'merge?.userToKeep', issues)
    // changed
    verify(wasUserCreated, false, 'wasUserCreated', issues)
    // changed
    verify(
      maybeUpsertCryptoAddressResult.newCryptoAddress,
      false,
      'maybeUpsertCryptoAddressResult.newCryptoAddress',
      issues,
    )
    // changed
    verify(
      maybeUpsertCryptoAddressResult.updatedCryptoAddress,
      true,
      'maybeUpsertCryptoAddressResult.updatedCryptoAddress',
      issues,
    )
    verify(
      maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated,
      false,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated',
      issues,
    )
    verify(
      maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
      false,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields',
      issues,
    )
    verify(didCapitalCanaryUpsert, false, 'didCapitalCanaryUpsert', issues)
    verify(
      postLoginUserActionSteps.hadOptInUserAction,
      false,
      'postLoginUserActionSteps.hadOptInUserAction',
      issues,
    )
    verify(
      postLoginUserActionSteps.pastActionsMinted.length,
      false,
      'postLoginUserActionSteps.pastActionsMinted.length',
      issues,
    )
    return {
      issues,
    }
  },
}
