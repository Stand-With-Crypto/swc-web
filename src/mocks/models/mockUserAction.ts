import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { getDefaultEnumFromUserActionByActionType } from '@/utils/shared/userActionCampaigns'
import { faker } from '@faker-js/faker'
import { UserAction, UserActionType } from '@prisma/client'

export function mockUserAction({
  actionType,
  userCryptoAddressId,
  userSessionId,
  userEmailAddressId,
}: Pick<
  UserAction,
  'actionType' | 'userCryptoAddressId' | 'userEmailAddressId' | 'userSessionId'
>): UserAction {
  return {
    ...mockCommonDatetimes(),
    actionType,
    campaignName: getDefaultEnumFromUserActionByActionType(actionType),
    userCryptoAddressId,
    userSessionId,
    userEmailAddressId,
    nftMintId: null,
    id: fakerFields.id(),
    userId: fakerFields.id(),
  }
}
