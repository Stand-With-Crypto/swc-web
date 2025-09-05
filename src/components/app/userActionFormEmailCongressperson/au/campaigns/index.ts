import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns/types'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import * as DEFAULT from './1-default'
import * as NEWMODE_DEBANKING from './20240611-newmode-debanking'
import * as Q2_2025_ELECTION from './20240611-q2-2025-election'
import * as WELCOME_MP_BACK_TO_PARLIAMENT_2025 from './20250714-mp-welcome'

export const DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME = AUUserActionEmailCampaignName.DEFAULT

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  AUUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [AUUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
  [AUUserActionEmailCampaignName.AU_Q2_2025_ELECTION]: Q2_2025_ELECTION.campaignMetadata,
  [AUUserActionEmailCampaignName.AU_NEWMODE_DEBANKING]: NEWMODE_DEBANKING.campaignMetadata,
  [AUUserActionEmailCampaignName.WELCOME_MP_BACK_TO_PARLIAMENT_2025]:
    WELCOME_MP_BACK_TO_PARLIAMENT_2025.campaignMetadata,
}

export function getAUEmailActionCampaignMetadata(campaignName: AUUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}
