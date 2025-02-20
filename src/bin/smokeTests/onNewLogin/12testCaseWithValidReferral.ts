import { faker } from '@faker-js/faker'
import { User, UserActionType } from '@prisma/client'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { fakerFields } from '@/mocks/fakerUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { onNewLogin } from '@/utils/server/thirdweb/onLogin'
import { generateReferralId } from '@/utils/shared/referralId'
import { sleep } from '@/utils/shared/sleep'

import { TestCase, verify } from './utils'

type OnNewLoginResult = Awaited<ReturnType<typeof onNewLogin>>
type OnNewLoginParams = Parameters<typeof onNewLogin>[0]
type TestParams = OnNewLoginParams

let testReferrer: User | null = null

async function createTestReferrer() {
  const referrerId = generateReferralId()
  const referrer = await prismaClient.user.create({
    data: {
      referralId: referrerId,
      informationVisibility: 'ANONYMOUS',
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      acquisitionReferer: '',
      acquisitionSource: '',
      acquisitionMedium: '',
      acquisitionCampaign: '',
    },
  })
  testReferrer = referrer
  return { referrer, referrerId }
}

function createTestParams(referrerId: string): TestParams {
  return {
    cryptoAddress: parseThirdwebAddress(faker.finance.ethereumAddress()),
    localUser: {
      persisted: {
        initialSearchParams: {
          utm_source: 'swc',
          utm_medium: 'referral',
          utm_campaign: referrerId,
        },
        initialReferer: '',
        datetimeFirstSeen: new Date().toISOString(),
      },
      currentSession: {
        datetimeOnLoad: new Date().toISOString(),
        refererOnLoad: '',
        searchParamsOnLoad: {
          utm_source: 'swc',
          utm_medium: 'referral',
          utm_campaign: referrerId,
        },
      },
    },
    getUserSessionId: () => Promise.resolve(fakerFields.id()),
    searchParams: {
      utm_source: 'swc',
      utm_medium: 'referral',
      utm_campaign: referrerId,
    },
    injectedFetchEmbeddedWalletMetadataFromThirdweb: () => Promise.resolve(null),
  }
}

function verifyBasicUserCreation(
  {
    existingUsersWithSource,
    embeddedWalletUserDetails,
    merge,
    wasUserCreated,
    maybeUpsertCryptoAddressResult,
  }: OnNewLoginResult,
  issues: string[],
) {
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
}

async function verifyReferralAction(issues: string[]) {
  if (!testReferrer) {
    throw new Error('Test referrer not found')
  }

  const referrer = await prismaClient.user.findFirst({
    where: { id: testReferrer.id },
    include: {
      userActions: {
        include: { userActionRefer: true },
      },
    },
  })

  const referAction = referrer?.userActions.find(
    action => action.actionType === UserActionType.REFER,
  )

  verify(referAction, true, 'referrer should have a REFER action', issues)

  verify(
    referAction?.userActionRefer?.referralsCount === 1,
    true,
    'referral count should be 1',
    issues,
  )
}

export const testCaseWithValidReferral: TestCase = {
  name: 'Test Case with valid referral',
  parameters: async () => {
    const { referrerId } = await createTestReferrer()
    return createTestParams(referrerId)
  },
  validateResults: async (data: OnNewLoginResult, issues: string[]) => {
    verifyBasicUserCreation(data, issues)

    // Wait a bit for the after() function to complete
    await sleep(100)

    await verifyReferralAction(issues)

    return { issues }
  },
}
