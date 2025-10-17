import { faker } from '@faker-js/faker'
import { DataCreationMethod, Prisma, UserAction, UserActionType } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const activeActionTypesByCountry: Record<SupportedCountryCodes, readonly UserActionType[]> = {
  [SupportedCountryCodes.US]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.CA]: [UserActionType.OPT_IN, UserActionType.TWEET],
  [SupportedCountryCodes.GB]: [UserActionType.OPT_IN, UserActionType.TWEET],
  [SupportedCountryCodes.AU]: [UserActionType.OPT_IN, UserActionType.TWEET, UserActionType.LETTER],
}

export function mockCreateUserActionInput({
  actionType: overrideActionType,
}: {
  actionType?: UserActionType
} = {}) {
  let countryCode = faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES))

  if (overrideActionType) {
    countryCode = faker.helpers.arrayElement(
      ORDERED_SUPPORTED_COUNTRIES.filter(code =>
        activeActionTypesByCountry[code].includes(overrideActionType),
      ),
    )
  }

  const actionType =
    overrideActionType ?? faker.helpers.arrayElement(activeActionTypesByCountry[countryCode])

  return {
    actionType,
    countryCode,
    campaignName: getActionDefaultCampaignName(actionType, countryCode),
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
