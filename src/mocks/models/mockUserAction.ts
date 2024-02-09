import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { faker } from '@faker-js/faker'
import { Prisma, UserAction, UserActionType } from '@prisma/client'

export function mockCreateUserActionInput() {
  const actionType = faker.helpers.arrayElement(Object.values(UserActionType))
  return {
    actionType,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType],
  } satisfies Omit<
    Prisma.UserActionCreateInput,
    'userId' | 'nftMintId' | 'userCryptoAddressId' | 'userSessionId' | 'userEmailAddressId' | 'user'
  >
}

export function mockUserAction(): UserAction {
  return {
    ...mockCreateUserActionInput(),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    nftMintId: null,
    userCryptoAddressId: null,
    userEmailAddressId: null,
    userId: fakerFields.id(),
    userSessionId: fakerFields.id(),
  }
}
