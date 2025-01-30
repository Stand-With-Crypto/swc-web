import { faker } from '@faker-js/faker'
import { DataCreationMethod, Prisma, UserAction } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'
import {
  ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
} from '@/utils/shared/userActionCampaigns'

export function mockCreateUserActionInput() {
  const actionType = faker.helpers.arrayElement(ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)
  return {
    actionType,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType],
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
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
