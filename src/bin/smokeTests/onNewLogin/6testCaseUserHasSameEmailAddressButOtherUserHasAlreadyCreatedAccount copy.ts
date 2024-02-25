import { DataCreationMethod } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'

export const testCaseUserHasSameEmailAddressButOtherUserHasAlreadyCreatedAccount: TestCase = {
  name: 'User Has Same Email Address But Other User Has Already Created Account',
  parameters: async () => {
    const legacyUser = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        userEmailAddresses: {
          create: {
            ...mockCreateUserEmailAddressInput(),
            isVerified: false,
          },
        },
        userCryptoAddresses: {
          create: {
            ...mockCreateUserCryptoAddressInput(),
            hasBeenVerifiedViaAuth: true,
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
        primaryUserEmailAddressId: legacyUser.userEmailAddresses[0].id,
        primaryUserCryptoAddressId: legacyUser.userCryptoAddresses[0].id,
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
    verify(existingUsersWithSource.length, false, 'existingUsersWithSource.length', issues)
    verify(embeddedWalletEmailAddress, true, 'embeddedWalletEmailAddress', issues)
    verify(merge?.usersToDelete.length, false, 'merge?.usersToDelete.length', issues)
    verify(merge?.userToKeep, false, 'merge?.userToKeep', issues)
    verify(wasUserCreated, true, 'wasUserCreated', issues)
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
      true,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated',
      issues,
    )
    verify(
      maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
      false,
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
