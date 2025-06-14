import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/gb/campaigns/types'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

import * as DEFAULT from './1-default'

export const DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME = GBUserActionEmailCampaignName.DEFAULT

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  GBUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [GBUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
}

export function getGBEmailActionCampaignMetadata(campaignName: GBUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}
