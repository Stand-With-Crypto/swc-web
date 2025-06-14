import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns/types'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import * as DEFAULT from './1-default'

export const DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME = AUUserActionEmailCampaignName.DEFAULT

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  AUUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [AUUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
}

export function getAUEmailActionCampaignMetadata(campaignName: AUUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}
