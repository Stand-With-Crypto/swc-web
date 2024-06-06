import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'
import { UserActionType } from '@prisma/client'

const USER_ACTIONS_EXCLUDED_FROM_CTA: UserActionType[] = [
  UserActionType.LIVE_EVENT,
  UserActionType.TWEET_AT_PERSON,
]

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
  const excludeUserActionTypes = new Set<UserActionType>(
    userHasEmbeddedWallet
      ? [UserActionType.NFT_MINT, ...USER_ACTIONS_EXCLUDED_FROM_CTA]
      : USER_ACTIONS_EXCLUDED_FROM_CTA,
  )

  const numActionsCompleted = performedUserActionTypes.reduce((count, action) => {
    return excludeUserActionTypes.has(action.actionType) ? count : count + 1
  }, 0)

  const numActionsAvailable =
    Object.values(USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN).length -
    excludeUserActionTypes.size

  return {
    progressValue: (numActionsCompleted / numActionsAvailable) * 100,
    numActionsCompleted,
    numActionsAvailable,
    excludeUserActionTypes,
  }
}
