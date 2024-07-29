import { UserEmailAddressSource } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'

export const testCaseWithPhoneSignUpWithExistingAccount: TestCase = {
  name: 'Phone Sign Up With Existing Account',
  parameters: async () => {
    const existingUser = await prismaClient.user.create({
      data: {
        ...mockCreateUserInput({ withData: true }),
        phoneNumber: '+15555555555',
        hasOptedInToSms: true,
        hasRepliedToOptInSms: true,
        userEmailAddresses: {
          create: {
            ...mockCreateUserEmailAddressInput(),
            isVerified: true,
            source: UserEmailAddressSource.USER_ENTERED,
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
      injectedFetchEmbeddedWalletMetadataFromThirdweb: () => ({
        userId: 'string',
        walletAddress: 'string',
        email: '',
        phone: '+15555555555',
        createdAt: new Date().toISOString(),
      }),
    }
  },
  validateResults: (
    {
      existingUsersWithSource,
      embeddedWalletUserDetails,
      merge,
      wasUserCreated,
      maybeUpsertCryptoAddressResult,
      maybeUpsertEmbeddedWalletEmailAddressResult,
      maybeUpsertPhoneNumberResult,
      hasSignedInWithEmail,
      didCapitalCanaryUpsert,
      postLoginUserActionSteps,
    },
    issues,
  ) => {
    verify(existingUsersWithSource.length, true, 'existingUsersWithSource.length', issues)
    verify(embeddedWalletUserDetails, true, 'embeddedWalletUserDetails', issues)
    verify(hasSignedInWithEmail, false, 'hasSignedInWithEmail', issues)
    verify(merge?.usersToDelete.length, false, 'merge?.usersToDelete.length', issues)
    verify(merge?.userToKeep, true, 'merge?.userToKeep', issues)
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
    verify(
      maybeUpsertPhoneNumberResult?.phoneNumber,
      true,
      'maybeUpsertPhoneNumberResult?.phoneNumber',
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
      true,
      'postLoginUserActionSteps.pastActionsMinted.length',
      issues,
    )
    return {
      issues,
    }
  },
}
