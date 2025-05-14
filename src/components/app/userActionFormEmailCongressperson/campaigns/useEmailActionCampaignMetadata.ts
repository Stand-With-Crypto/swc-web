import { useMemo } from 'react'
import { getEmailActionCampaignMetadata } from '.'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function useEmailActionCampaignMetadata(campaignName: USUserActionEmailCampaignName) {
  return useMemo(() => getEmailActionCampaignMetadata(campaignName), [campaignName])
}
