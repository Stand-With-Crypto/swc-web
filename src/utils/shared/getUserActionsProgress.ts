import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'

import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

const USER_ACTIONS_EXCLUDED_FROM_CTA: UserActionType[] = [
  UserActionType.LIVE_EVENT,
  UserActionType.TWEET_AT_PERSON,
  UserActionType.RSVP_EVENT,
]

export interface GetUserActionsProgressArgs {
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
  const excludeUserActionTypes = new Set<UserActionType>(
    userHasEmbeddedWallet
      ? [UserActionType.NFT_MINT, ...USER_ACTIONS_EXCLUDED_FROM_CTA]
      : USER_ACTIONS_EXCLUDED_FROM_CTA,
  )

  const numActionsCompleted = uniqBy(
    performedUserActionTypes,
    action => `${action.actionType}-${action.campaignName}`,
  ).reduce((count, action) => {
    return excludeUserActionTypes.has(action.actionType) ||
      action.campaignName !== USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[action.actionType]
      ? count
      : count + 1
  }, 0)

  const numActionsAvailable = USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
    ({ action }) => !excludeUserActionTypes.has(action),
  ).length

  return {
    progressValue: (numActionsCompleted / numActionsAvailable) * 100,
    numActionsCompleted,
    numActionsAvailable,
    excludeUserActionTypes,
  }
}
