import { UserActionType } from '@prisma/client'

import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN,
  UserActionCampaignName,
} from '@/utils/shared/userActionCampaigns'

interface CheckIfUserActionWithCampaignIsCompleteProps {
  action: UserActionType
  campaign: UserActionCampaignName
}

export function checkIfUserActionWithCampaignIsComplete({
  action,
  campaign,
}: CheckIfUserActionWithCampaignIsCompleteProps) {
  const defaultCampaign = USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[action]
  const additionalCampaigns = USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN[action] ?? []
  const combinedCampaigns = [...additionalCampaigns, defaultCampaign]
  return combinedCampaigns.includes(campaign)
}
