import { UserActionOptInType, UserActionType } from '@prisma/client'

import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

import { getDefaultParameters, mockEmbeddedWalletMetadata, TestCase, verify } from './utils'
import { UserEmailAddressSource } from '.prisma/client'

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
          userActions: {
            create: {
              actionType: UserActionType.OPT_IN,
              campaignName: UserActionOptInCampaignName.DEFAULT,
              countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
              userActionOptIn: {
                create: {
                  optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
                },
              },
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
      // changed
      verify(
        postLoginUserActionSteps.hadOptInUserAction,
        true,
        'postLoginUserActionSteps.hadOptInUserAction',
        issues,
      )
      // changed
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
