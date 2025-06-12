/* eslint-disable @typescript-eslint/no-require-imports */
import { CampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/campaigns/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import * as DEFAULT from './1-default'

const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  USUserActionEmailCampaignName,
  CampaignMetadata
> = {
  // Legacy (for type safety only)
  [USUserActionEmailCampaignName.FIT21_2024_04]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.SEC_COMMISSIONER_2024]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.WELCOME_119_CONGRESS_2025]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3_MARCH_3RD]:
    DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3_MARCH_10TH]:
    DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.GENIUS_ACT_8_MAY_2025]: DEFAULT.campaignMetadata,

  // New
  [USUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.GENIUS_ACT_MAY_13_2025]:
    require('./20250513-genius-act').campaignMetadata,
  [USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025]: require('./20250514-founders-push')
    .campaignMetadata,
}

export function getEmailActionCampaignMetadata(campaignName: USUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}
