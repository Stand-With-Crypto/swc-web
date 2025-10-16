import { CampaignMetadata } from '@/components/app/userActionFormLetter/au/campaigns/types'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import * as DEFAULT from './1-default'

export const DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME = AUUserActionLetterCampaignName.DEFAULT

const LETTER_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  AUUserActionLetterCampaignName,
  CampaignMetadata
> = {
  [AUUserActionLetterCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
}

export function getAULetterActionCampaignMetadata(campaignName: AUUserActionLetterCampaignName) {
  return LETTER_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName]
}

