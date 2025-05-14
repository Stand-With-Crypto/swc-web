import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { DEEPLINK_SLUG as DEFAULT_DEEPLINK_SLUG } from './1-default'
import { DEEPLINK_SLUG as FOUNDERS_PUSH_MAY_14_2025_DEEPLINK_SLUG } from './20250514-founders-push'

export const EMAIL_ACTION_DEEPLINK_SLUG_TO_CAMPAIGN_NAME: Record<
  string,
  USUserActionEmailCampaignName
> = {
  [DEFAULT_DEEPLINK_SLUG]: USUserActionEmailCampaignName.DEFAULT,
  [FOUNDERS_PUSH_MAY_14_2025_DEEPLINK_SLUG]:
    USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025,
}
