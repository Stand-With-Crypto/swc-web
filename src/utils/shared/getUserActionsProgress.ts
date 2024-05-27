import { UserActionType } from '@prisma/client'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { getValues } from '@/utils/shared/getEntries'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export const USER_ACTIONS_AVAILABLE_FOR_CTA = new Map<UserActionType, boolean>([
  [UserActionType.CALL, true],
  [UserActionType.EMAIL, true],
  [UserActionType.DONATION, true],
  [UserActionType.NFT_MINT, true],
  [UserActionType.OPT_IN, true],
  [UserActionType.TWEET, true],
  [UserActionType.VOTER_REGISTRATION, true],
  [UserActionType.LIVE_EVENT, false],
  [UserActionType.TWEET_AT_PERSON, false],
])

export const USER_ACTIONS_EXCLUDED_FROM_CTA = Array.from(USER_ACTIONS_AVAILABLE_FOR_CTA)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key)

interface GetUserActionsProgressArgs {
  userHasEmbeddedWallet: boolean
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
}

export function getUserActionsProgress({
  userHasEmbeddedWallet,
  performedUserActionTypes,
}: GetUserActionsProgressArgs) {
  const excludeUserActionTypes = userHasEmbeddedWallet
    ? [UserActionType.NFT_MINT, ...USER_ACTIONS_EXCLUDED_FROM_CTA]
    : USER_ACTIONS_EXCLUDED_FROM_CTA

  const numActionsCompleted = performedUserActionTypes
    .filter(performedAction => {
      return !excludeUserActionTypes.includes(performedAction.actionType)
    })
    .filter(
      performedAction =>
        !USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.some(
          item =>
            item.campaign !== performedAction.campaignName &&
            item.action === performedAction.actionType,
        ),
    ).length

  const numActionsAvailable = Object.values(
    USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
      item => !excludeUserActionTypes.includes(item.action),
    ),
  ).length

  return {
    progressValue: (numActionsCompleted / numActionsAvailable) * 100,
    numActionsCompleted,
    numActionsAvailable,
    excludeUserActionTypes,
  }
}
