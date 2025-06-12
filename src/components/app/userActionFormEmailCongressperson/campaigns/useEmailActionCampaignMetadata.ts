import { useMemo } from 'react'

import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import { getEmailActionCampaignMetadata } from '.'

export function useEmailActionCampaignMetadata(campaignName: USUserActionEmailCampaignName) {
  return useMemo(() => getEmailActionCampaignMetadata(campaignName), [campaignName])
}
