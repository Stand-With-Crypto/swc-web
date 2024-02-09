import { UserEmailAddressSource } from '.prisma/client'
import { runBin } from '@/bin/runBin'
import { fakerFields } from '@/mocks/fakerUtils'
import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { ThirdwebEmbeddedWalletMetadata } from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { onNewLogin } from '@/utils/server/thirdweb/onLogin'
import { logger } from '@/utils/shared/logger'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
/**
 * Run this script only after you have the server AND Inngest running locally and you've wiped your database.
 */

type Params = Parameters<typeof onNewLogin>[0]
type Issue = string
type TestCase = {
  name: string
  parameters: () => Promise<Params>
  validateResults: (data: Awaited<ReturnType<typeof onNewLogin>>, issues: Issue[]) => void
}

function getDefaultParameters(): Params {
  return {
    cryptoAddress: faker.finance.ethereumAddress(),
    localUser: null,
    getUserSessionId: () => fakerFields.id(),
    // dependency injecting this in to the function so we can mock it in tests
    injectedFetchEmbeddedWalletMetadataFromThirdweb: () => Promise.resolve(null),
  }
}

async function mockEmbeddedWalletMetadata(email: string): Promise<ThirdwebEmbeddedWalletMetadata> {
  return {
    userId: 'string',
    walletAddress: 'string',
    email,
    createdAt: new Date().toISOString(),
  }
}

function verify(condition: boolean | (() => boolean), errorMessage: string, issues: Issue[]) {
  const isValid = _.isBoolean(condition) ? condition : condition()
  if (!isValid) {
    issues.push(errorMessage)
  }
}

async function runTestCase({ validateResults, parameters, name }: TestCase) {
  logger.info(`------TEST CASE------: ${name} started`)
  const params = await parameters()
  const data = await onNewLogin(params)
  const issues: Issue[] = []
  validateResults(data, issues)
  if (issues.length > 0) {
    throw new Error(`Issues with ${name}:\n${issues.join('\n')}`)
  }
  logger.info(`------TEST CASE------: ${name} passed`)
}

const testCaseNewUser: TestCase = {
  name: 'New User',
  parameters: async () => getDefaultParameters(),
  validateResults: ({
    user,
    existingUsersWithSource,
    embeddedWalletEmailAddress,
    merge,
    wasUserCreated,
    maybeUpsertCryptoAddressResult,
    maybeUpsertEmbeddedWalletEmailAddressResult,
    didCapitalCanaryUpsert,
    postLoginUserActionSteps,
  }) => {
    const issues: Issue[] = []
    verify(!!user, 'user null', issues)
    verify(!existingUsersWithSource.length, 'existingUsersWithSource has records', issues)
    verify(!embeddedWalletEmailAddress, 'embeddedWalletEmailAddress exists', issues)
    verify(!merge.usersToDelete.length, 'merge.usersToDelete has records', issues)
    verify(!merge.userToKeep, 'merge.userToKeep exists', issues)
    verify(wasUserCreated, "user wasn't created", issues)
    verify(
      !!maybeUpsertCryptoAddressResult.newCryptoAddress,
      'maybeUpsertCryptoAddressResult.newCryptoAddress null',
      issues,
    )
    verify(
      !maybeUpsertCryptoAddressResult.updatedCryptoAddress,
      'maybeUpsertCryptoAddressResult.updatedCryptoAddress exists',
      issues,
    )
    verify(
      !maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated exists',
      issues,
    )
    verify(
      !maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
      'maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields exists',
      issues,
    )
    verify(!didCapitalCanaryUpsert, 'didCapitalCanaryUpsert exists', issues)
    verify(
      !postLoginUserActionSteps.hadOptInUserAction,
      'postLoginUserActionSteps?.hadOptInUserAction exists',
      issues,
    )
    verify(
      !postLoginUserActionSteps.pastActionsMinted.length,
      'postLoginUserActionSteps.pastActionsMinted exists',
      issues,
    )
    return {
      issues,
    }
  },
}

const testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail: TestCase =
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
    validateResults: ({
      user,
      existingUsersWithSource,
      embeddedWalletEmailAddress,
      merge,
      wasUserCreated,
      maybeUpsertCryptoAddressResult,
      maybeUpsertEmbeddedWalletEmailAddressResult,
      didCapitalCanaryUpsert,
      postLoginUserActionSteps,
    }) => {
      const issues: Issue[] = []
      verify(!!user, 'user null', issues)
      // changed
      verify(existingUsersWithSource.length === 1, 'existingUsersWithSource has records', issues)
      // changed
      verify(!!embeddedWalletEmailAddress, 'embeddedWalletEmailAddress null', issues)
      verify(!merge.usersToDelete.length, 'merge.usersToDelete has records', issues)
      verify(!merge.userToKeep, 'merge.userToKeep exists', issues)
      verify(wasUserCreated, "user wasn't created", issues)
      verify(
        !!maybeUpsertCryptoAddressResult.newCryptoAddress,
        'maybeUpsertCryptoAddressResult.newCryptoAddress null',
        issues,
      )
      verify(
        !maybeUpsertCryptoAddressResult.updatedCryptoAddress,
        'maybeUpsertCryptoAddressResult.updatedCryptoAddress exists',
        issues,
      )
      verify(
        !maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated,
        'maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated exists',
        issues,
      )
      // changed
      verify(
        !!maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields,
        'maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields null',
        issues,
      )
      verify(!didCapitalCanaryUpsert, 'didCapitalCanaryUpsert exists', issues)
      verify(
        !postLoginUserActionSteps.hadOptInUserAction,
        'postLoginUserActionSteps?.hadOptInUserAction exists',
        issues,
      )
      verify(
        !postLoginUserActionSteps.pastActionsMinted.length,
        'postLoginUserActionSteps.pastActionsMinted exists',
        issues,
      )
      return {
        issues,
      }
    },
  }

async function smokeTestOnLogin() {
  const tests = [
    testCaseNewUser,
    testCaseUserPreviouslySignedUpOnCoinbaseAndThenLoggedInWithEmbeddedWalletWithSameEmail,
  ]
  for (const test of tests) {
    await runTestCase(test)
  }
}

runBin(smokeTestOnLogin)
