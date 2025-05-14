'use client'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/campaigns/types'

import * as DEFAULT from './1-default'
import * as FOUNDERS_PUSH_MAY_14_2025 from './20250514-founders-push'

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  USUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [USUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025]:
    FOUNDERS_PUSH_MAY_14_2025.campaignMetadata,
}

const EMAIL_ACTION_CAMPAIGN_NAME_TO_CTA_CONFIG: Record<
  USUserActionEmailCampaignName,
  UserActionGridCTACampaign
> = {
  [USUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignCTAConfig,
  [USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025]:
    FOUNDERS_PUSH_MAY_14_2025.campaignCTAConfig,
}

export function getEmailActionCampaignMetadata(campaignName: USUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}

export function getEmailActionCTAConfigByCampaign(campaignName: USUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_CTA_CONFIG[campaignName]
}
