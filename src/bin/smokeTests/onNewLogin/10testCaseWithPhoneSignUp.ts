import { getDefaultParameters, TestCase, verify } from './utils'

export const testCaseWithPhoneSignUp: TestCase = {
  name: 'Phone Sign Up',
  parameters: async () => ({
    ...getDefaultParameters(),
    injectedFetchEmbeddedWalletMetadataFromThirdweb: () =>
      Promise.resolve({
        email: '',
        phone: '+13692125876',
        userId: '123567',
        walletAddress: '0x123',
        createdAt: new Date().toISOString(),
      }),
  }),
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
