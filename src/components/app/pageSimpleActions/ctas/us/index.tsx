import { US_DAY_OF_ACTION_CTAS } from '@/components/app/pageSimpleActions/ctas/us/dayOfAction'
import { SimpleActionsCampaignName } from '@/components/app/pageSimpleActions/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'

export const US_SIMPLE_PAGE_CAMPAIGN_CTAS: Record<SimpleActionsCampaignName, UserActionGridCTA> = {
  [SimpleActionsCampaignName.DAY_OF_ACTION_AUG_14_2025]: US_DAY_OF_ACTION_CTAS,
}
