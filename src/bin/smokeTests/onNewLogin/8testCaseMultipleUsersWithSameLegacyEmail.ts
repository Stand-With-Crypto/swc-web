import { DataCreationMethod } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'

export const testCaseMultipleUsersWithSameLegacyEmail: TestCase = {
  name: 'Test Case Multiple Users With Same Legacy Email',
  parameters: async () => {
    const legacyUser = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userEmailAddresses: {
          create: {
            ...mockCreateUserEmailAddressInput(),
            isVerified: false,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
      },
      include: {
        userEmailAddresses: true,
        userSessions: true,
      },
    })
    await prismaClient.user.update({
      where: { id: legacyUser.id },
      data: {
        primaryUserEmailAddressId: legacyUser.userEmailAddresses[0].id,
      },
    })
    const legacyUser2 = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userEmailAddresses: {
          create: {
            ...mockCreateUserEmailAddressInput(),
            emailAddress: legacyUser.userEmailAddresses[0].emailAddress,
            isVerified: false,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
      },
      include: {
        userEmailAddresses: true,
        userSessions: true,
      },
    })
    await prismaClient.user.update({
      where: { id: legacyUser2.id },
      data: {
        primaryUserEmailAddressId: legacyUser2.userEmailAddresses[0].id,
      },
    })
    return {
      ...getDefaultParameters(),
      injectedFetchEmbeddedWalletMetadataFromThirdweb: () =>
        mockEmbeddedWalletMetadata(legacyUser.userEmailAddresses[0].emailAddress),
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
    verify(
      maybeUpsertCryptoAddressResult.newCryptoAddress,
      true,
      'maybeUpsertCryptoAddressResult.newCryptoAddress',
      issues,
    )
    verify(
      maybeUpsertCryptoAddressResult.updatedCryptoAddress,
      false,
      'maybeUpsertCryptoAddressResult.updatedCryptoAddress',
      issues,
    )
    verify(
      maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated,
      false,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated',
      issues,
    )
    // changed
    verify(
      maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
      true,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields',
      issues,
    )
    verify(didCapitalCanaryUpsert, true, 'didCapitalCanaryUpsert', issues)
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
