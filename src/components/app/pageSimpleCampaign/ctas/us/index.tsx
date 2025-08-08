import { US_DAY_OF_ACTION_CTAS } from '@/components/app/pageSimpleCampaign/ctas/us/dayOfAction'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'

export const US_SIMPLE_PAGE_CAMPAIGN_CTAS: Record<SimpleCampaignName, UserActionGridCTA> = {
  [SimpleCampaignName.DAY_OF_ACTION_AUG_14_2025]: US_DAY_OF_ACTION_CTAS,
}
