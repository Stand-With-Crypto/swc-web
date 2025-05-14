import { useMemo } from 'react'

import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

import * as DEFAULT from './1-default'
import * as FOUNDERS_PUSH_MAY_14_2025 from './20250514-founders-push'

export interface CampaignMetadata {
  campaignName: USUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (props?: GetTextProps & { address?: string }) => string
}

export const EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA: Record<
  USUserActionEmailCampaignName,
  CampaignMetadata
> = {
  [USUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignMetadata,
  [USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025]:
    FOUNDERS_PUSH_MAY_14_2025.campaignMetadata,
}

export const EMAIL_ACTION_CAMPAIGN_NAME_TO_CTA_CONFIG: Record<
  USUserActionEmailCampaignName,
  UserActionGridCTACampaign
> = {
  [USUserActionEmailCampaignName.DEFAULT]: DEFAULT.campaignCTAConfig,
  [USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025]:
    FOUNDERS_PUSH_MAY_14_2025.campaignCTAConfig,
}

export function useEmailActionCampaignMetadata(campaignName: USUserActionEmailCampaignName) {
  return useMemo(() => EMAIL_ACTION_CAMPAIGN_NAME_TO_METADATA[campaignName], [campaignName])
}

export function getEmailActionCTAConfigByCampaign(campaignName: USUserActionEmailCampaignName) {
  return EMAIL_ACTION_CAMPAIGN_NAME_TO_CTA_CONFIG[campaignName]
}
