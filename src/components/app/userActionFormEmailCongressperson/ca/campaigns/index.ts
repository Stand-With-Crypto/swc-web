import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns/types'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'

import * as DEFAULT from './1-default'

export const DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME = CAUserActionEmailCampaignName.DEFAULT

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  CAUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [CAUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
}

export function getCAEmailActionCampaignMetadata(campaignName: CAUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}
