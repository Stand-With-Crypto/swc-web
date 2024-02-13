import { TestCase, getDefaultParameters, verify } from './utils'

export const testCaseNewUser: TestCase = {
  name: 'New User',
  parameters: async () => getDefaultParameters(),
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
    verify(embeddedWalletEmailAddress, false, 'embeddedWalletEmailAddress', issues)
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
