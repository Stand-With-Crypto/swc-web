import { faker } from '@faker-js/faker'
import { DataCreationMethod, Prisma, UserAction, UserActionType } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const activeActionTypesByCountry: Record<SupportedCountryCodes, readonly UserActionType[]> = {
  [SupportedCountryCodes.US]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.CA]: CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.GB]: GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.AU]: AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
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
