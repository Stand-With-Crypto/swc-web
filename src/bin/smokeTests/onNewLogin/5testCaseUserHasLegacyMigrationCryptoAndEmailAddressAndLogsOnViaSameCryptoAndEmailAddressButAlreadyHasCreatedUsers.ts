import { DataCreationMethod } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'

export const testCaseUserHasLegacyMigrationCryptoAndEmailAddressAndLogsOnViaSameCryptoAndEmailAddressButAlreadyHasCreatedUsers: TestCase =
  {
    name: 'User Has Legacy Migration Crypto And Email Address And Logs On Via Same Crypto And Email Address But Already Has Created Users',
    parameters: async () => {
      const legacyUser1 = await prismaClient.user.create({
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
        where: { id: legacyUser1.id },
        data: {
          primaryUserCryptoAddressId: legacyUser1.userCryptoAddresses[0].id,
        },
      })

      const legacyUser2 = await prismaClient.user.create({
        data: {
          ...mockCreateUserInput({ withData: true }),
          userEmailAddresses: {
            create: {
              ...mockCreateUserEmailAddressInput(),
              isVerified: false,
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            },
          },
          userSessions: {
            create: {},
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
      const newUser = await prismaClient.user.create({
        data: {
          ...mockCreateUserInput({ withData: true }),
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
      return {
        ...getDefaultParameters(),
        getUserSessionId: () => Promise.resolve(newUser.userSessions[0].id),
        cryptoAddress: legacyUser1.userCryptoAddresses[0].cryptoAddress,
        injectedFetchEmbeddedWalletMetadataFromThirdweb: () =>
          mockEmbeddedWalletMetadata(legacyUser2.userEmailAddresses[0].emailAddress),
      }
    },
    validateResults: (
      {
        user,
        existingUsersWithSource,
        embeddedWalletUserDetails,
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
      // changed
      verify(embeddedWalletUserDetails, true, 'embeddedWalletUserDetails', issues)
      // changed
      verify(merge?.usersToDelete.length === 2, true, 'merge?.usersToDelete.length === 2', issues)
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
      // changed
      verify(
        maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
        true,
        'maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields',
        issues,
      )
      // changed
      verify(didCapitalCanaryUpsert, true, 'didCapitalCanaryUpsert', issues)
      verify(
        postLoginUserActionSteps.hadOptInUserAction,
        false,
        'postLoginUserActionSteps.hadOptInUserAction',
        issues,
      )
      verify(
        postLoginUserActionSteps.pastActionsMinted.length,
        true,
        'postLoginUserActionSteps.pastActionsMinted.length',
        issues,
      )

      // changed
      verify(
        user.userEmailAddresses.length === 1,
        true,
        'user.userEmailAddresses.length === 1',
        issues,
      )
      // changed
      verify(
        user.userEmailAddresses[0].isVerified,
        true,
        'user.userEmailAddresses[0].isVerified',
        issues,
      )
      // changed
      verify(
        user.userCryptoAddresses.length === 1,
        true,
        'user.userCryptoAddresses.length ===1',
        issues,
      )
      // changed
      verify(
        user.userCryptoAddresses[0].embeddedWalletUserEmailAddressId ===
          user.userEmailAddresses[0].id,
        true,
        'user.userCryptoAddresses[0].embeddedWalletUserEmailAddressId === user.userEmailAddresses[0].id',
        issues,
      )
      return {
        issues,
      }
    },
  }
