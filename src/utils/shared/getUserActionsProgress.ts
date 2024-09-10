import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'

import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

const USER_ACTIONS_EXCLUDED_FROM_CTA: UserActionType[] = [
  UserActionType.LIVE_EVENT,
  UserActionType.TWEET_AT_PERSON,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
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

  const activeUserActionCTAWithCampaign = new Set<string>(
    USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.map(
      ({ action, campaign }) => `${action}-${campaign}`,
    ),
  )

  const numActionsCompleted = uniqBy(
    performedUserActionTypes,
    action => `${action.actionType}-${action.campaignName}`,
  ).reduce((count, action) => {
    const actionWithCampaign = `${action.actionType}-${action.campaignName}`

    if (excludeUserActionTypes.has(action.actionType)) return count

    if (!activeUserActionCTAWithCampaign.has(actionWithCampaign)) return count

    return count + 1
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
