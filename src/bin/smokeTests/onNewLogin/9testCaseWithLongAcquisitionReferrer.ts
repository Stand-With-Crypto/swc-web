import { faker } from '@faker-js/faker'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { fakerFields } from '@/mocks/fakerUtils'

import { TestCase, verify } from './utils'

export const testCaseWithLongAcquisitionReferer: TestCase = {
  name: 'Test Case with long Acquisition referer',
  parameters: async () => {
    return {
      cryptoAddress: parseThirdwebAddress(faker.finance.ethereumAddress()),
      localUser: {
        persisted: {
          initialSearchParams: {
            utm_source: faker.string.alphanumeric({ length: 200 }),
            utm_medium: faker.string.alphanumeric({ length: 200 }),
            utm_campaign: faker.string.alphanumeric({ length: 200 }),
          },
          initialReferer: faker.string.alphanumeric({ length: 200 }),
          datetimeFirstSeen: new Date().toISOString(),
        },
        currentSession: {
          datetimeOnLoad: new Date().toISOString(),
          refererOnLoad: '',
          searchParamsOnLoad: {
            utm_source: faker.string.alphanumeric({ length: 200 }),
            utm_medium: faker.string.alphanumeric({ length: 200 }),
            utm_campaign: faker.string.alphanumeric({ length: 200 }),
          },
        },
      },
      getUserSessionId: () => Promise.resolve(fakerFields.id()),
      // dependency injecting this in to the function so we can mock it in tests
      injectedFetchEmbeddedWalletMetadataFromThirdweb: () => Promise.resolve(null),
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
      didCapitalCanaryUpsert,
      postLoginUserActionSteps,
    },
    issues,
  ) => {
    verify(existingUsersWithSource.length, false, 'existingUsersWithSource.length', issues)
    verify(embeddedWalletUserDetails, false, 'embeddedWalletUserDetails', issues)
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
      true,
      'postLoginUserActionSteps.pastActionsMinted.length',
      issues,
    )
    return {
      issues,
    }
  },
}
