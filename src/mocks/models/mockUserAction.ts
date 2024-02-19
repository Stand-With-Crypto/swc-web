import { faker } from '@faker-js/faker'
import { DataCreationMethod, Prisma, UserAction, UserActionType } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'

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
    userCryptoAddressId: null,
    userSessionId: fakerFields.id(),
    userEmailAddressId: null,
    nftMintId: null,
    id: fakerFields.id(),
    userId: fakerFields.id(),
    dataCreationMethod: DataCreationMethod.BY_USER,
  }
}
