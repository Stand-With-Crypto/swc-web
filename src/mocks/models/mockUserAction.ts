import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP
} from '@/utils/shared/userActionCampaigns'
import { UserAction } from '@prisma/client'

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
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType],
    userCryptoAddressId,
    userSessionId,
    userEmailAddressId,
    nftMintId: null,
    id: fakerFields.id(),
    userId: fakerFields.id(),
  }
}
