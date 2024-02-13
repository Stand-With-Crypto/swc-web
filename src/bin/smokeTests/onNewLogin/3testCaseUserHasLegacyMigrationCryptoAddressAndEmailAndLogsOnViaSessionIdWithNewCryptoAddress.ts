import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserEmailAddressSource } from '.prisma/client'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { DataCreationMethod } from '@prisma/client'
import { TestCase, getDefaultParameters, verify } from './utils'

export const testCaseUserHasLegacyMigrationCryptoAddressAndEmailAndLogsOnViaSessionIdWithNewCryptoAddress: TestCase =
  {
    name: 'User Has Legacy Migration Crypto Address And Email And Logs On Via Session Id With New Crypto Address',
    parameters: async () => {
      const existingUser = await prismaClient.user.create({
        data: {
          ...mockCreateUserInput({ withData: true }),
          userEmailAddresses: {
            create: {
              ...mockCreateUserEmailAddressInput(),
              isVerified: false,
              source: UserEmailAddressSource.USER_ENTERED,
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFULL,
            },
          },
          userCryptoAddresses: {
            create: {
              ...mockCreateUserCryptoAddressInput(),
              hasBeenVerifiedViaAuth: false,
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFULL,
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
          primaryUserEmailAddressId: existingUser.userEmailAddresses[0].id,
          primaryUserCryptoAddressId: existingUser.userCryptoAddresses[0].id,
        },
      })
      return {
        ...getDefaultParameters(),
        getUserSessionId: () => existingUser.userSessions[0].id,
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
