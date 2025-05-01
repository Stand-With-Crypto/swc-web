import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import {
  USUserActionLiveEventCampaignName,
  USUserActionTweetCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const USER_ACTION_LIVE_EVENT_LOCATION: Record<USUserActionLiveEventCampaignName, string> = {
  [USUserActionLiveEventCampaignName['2024_03_04_LA']]: 'CA',
}

export const FOLLOW_ON_X_CAMPAIGNS_BY_COUNTRY: Record<SupportedCountryCodes, string | null> = {
  [SupportedCountryCodes.US]: USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
  [SupportedCountryCodes.AU]: AUUserActionTweetCampaignName.DEFAULT,
  [SupportedCountryCodes.CA]: CAUserActionTweetCampaignName.DEFAULT,
  [SupportedCountryCodes.GB]: GBUserActionTweetCampaignName.DEFAULT,
}
