import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserEmailAddressSource } from '.prisma/client'
import { TestCase, getDefaultParameters, verify, mockEmbeddedWalletMetadata } from './utils'

export const testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail: TestCase =
  {
    name: 'User Previously Signed Up On Coinbase And Then Logged In With Embedded Wallet With Same Email',
    parameters: async () => {
      const existingUser = await prismaClient.user.create({
        data: {
          ...mockCreateUserInput({ withData: true }),
          userEmailAddresses: {
            create: {
              ...mockCreateUserEmailAddressInput(),
              isVerified: true,
              source: UserEmailAddressSource.VERIFIED_THIRD_PARTY,
            },
          },
        },
        include: {
          userEmailAddresses: true,
        },
      })
      await prismaClient.user.update({
        where: { id: existingUser.id },
        data: { primaryUserEmailAddressId: existingUser.userEmailAddresses[0].id },
      })
      return {
        ...getDefaultParameters(),
        injectedFetchEmbeddedWalletMetadataFromThirdweb: () =>
          mockEmbeddedWalletMetadata(existingUser.userEmailAddresses[0].emailAddress),
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
      // changed
      verify(embeddedWalletEmailAddress, true, 'embeddedWalletEmailAddress', issues)
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
      //changed
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
