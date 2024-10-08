import { UserActionType } from '@prisma/client'

import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UserActionCampaignName,
} from '@/utils/shared/userActionCampaigns'

/**
 * Remember to update {@link USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN} so that the correct campaign CTA is displayed.
 * Failing to add the correct campaign will result in error.
 *
 * Also remember to remove the campaign from {@link USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN} if it is not needed anymore.
 * Keeping a campaign here will result in an increase of the number of total actions in profile page.
 */
export const USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN: ReadonlyArray<{
  action: ActiveClientUserActionType
  campaign: UserActionCampaignName
}> = [
  { action: UserActionType.OPT_IN, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.OPT_IN },
  {
    action: UserActionType.VOTER_REGISTRATION,
    campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VOTER_REGISTRATION,
  },
  {
    action: UserActionType.VOTER_ATTESTATION,
    campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VOTER_ATTESTATION,
  },
  {
    action: UserActionType.VOTING_INFORMATION_RESEARCHED,
    campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VOTING_INFORMATION_RESEARCHED,
  },
  // { action: UserActionType.EMAIL, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.EMAIL }, // Commented out because of the 2024 election.
  // { action: UserActionType.CALL, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.CALL }, // Commented out because of the 2024 election.
  { action: UserActionType.TWEET, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.TWEET },
  // { action: UserActionType.DONATION, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.DONATION }, // Commented out because of the 2024 election.
  // { action: UserActionType.NFT_MINT, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.NFT_MINT }, // Commented out because of the 2024 election.
]
