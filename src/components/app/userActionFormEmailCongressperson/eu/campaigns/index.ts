import { gracefullyError } from '@/utils/shared/gracefullyError'
import { EUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/eu/euUserActionCampaigns'

import { CampaignMetadata } from './types'

export function getEUEmailActionCampaignMetadata(
  campaignName: EUUserActionEmailCampaignName,
): CampaignMetadata | null {
  // TODO(EU): Implement EU campaign metadata when campaigns are added
  return gracefullyError({
    msg: `getEUEmailActionCampaignMetadata received unsupported campaign name: ${campaignName}`,
    fallback: null,
    hint: {
      tags: {
        domain: 'getEUEmailActionCampaignMetadata',
      },
      extra: {
        campaignName,
      },
    },
  })
}
