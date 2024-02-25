import { DataCreationMethod } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'

export const testCaseMultipleUsersWithSameLegacyCryptoAddress: TestCase = {
  name: 'Test Case Multiple Users With Same Legacy Crypto Address',
  parameters: async () => {
    const legacyUser = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userCryptoAddresses: {
          create: {
            ...mockCreateUserCryptoAddressInput(),
            hasBeenVerifiedViaAuth: false,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
      },
      include: {
        userCryptoAddresses: true,
        userEmailAddresses: true,
        userSessions: true,
      },
    })
    await prismaClient.user.update({
      where: { id: legacyUser.id },
      data: {
        primaryUserCryptoAddressId: legacyUser.userCryptoAddresses[0].id,
      },
    })
    const legacyUser2 = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userCryptoAddresses: {
          create: {
            ...mockCreateUserCryptoAddressInput(),
            cryptoAddress: legacyUser.userCryptoAddresses[0].cryptoAddress,
            hasBeenVerifiedViaAuth: false,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
      },
      include: {
        userCryptoAddresses: true,
        userEmailAddresses: true,
        userSessions: true,
      },
    })
    await prismaClient.user.update({
      where: { id: legacyUser2.id },
      data: {
        primaryUserCryptoAddressId: legacyUser2.userCryptoAddresses[0].id,
      },
    })
    return {
      ...getDefaultParameters(),
      cryptoAddress: legacyUser.userCryptoAddresses[0].cryptoAddress,
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
    // changed
    verify(merge?.usersToDelete.length, true, 'merge?.usersToDelete.length', issues)
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
