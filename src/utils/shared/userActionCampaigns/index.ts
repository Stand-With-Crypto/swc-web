import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ActiveClientUserActionWithCampaignType } from '@/utils/shared/userActionCampaigns'
import {
  UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  UK_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UKActiveClientUserActionWithCampaignType,
  UKUserActionCampaignName,
  UKUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/uk/ukUserActionCampaigns'
import {
  US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  USActiveClientUserActionWithCampaignType,
  USUserActionCampaignName,
  USUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const COUNTRY_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN: Record<
  SupportedCountryCodes,
  readonly (USActiveClientUserActionWithCampaignType | UKActiveClientUserActionWithCampaignType)[]
> = {
  [SupportedCountryCodes.US]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.GB]: UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.CA]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.AU]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
}

export type UserActionCampaignName = USUserActionCampaignName | UKUserActionCampaignName

export type UserActionCampaigns = USUserActionCampaigns | UKUserActionCampaigns

export const COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP: Record<
  SupportedCountryCodes,
  Record<ActiveClientUserActionWithCampaignType, string>
> = {
  [SupportedCountryCodes.US]: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.GB]: UK_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.CA]: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.AU]: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
}
