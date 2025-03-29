import { UserActionType } from '@prisma/client'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  AUActiveClientUserActionWithCampaignType,
  AUUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import {
  CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  CAActiveClientUserActionWithCampaignType,
  CAUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import {
  GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  GBActiveClientUserActionWithCampaignType,
  GBUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import {
  US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  USActiveClientUserActionWithCampaignType,
  USUserActionCampaigns,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

// Define which action types are available for each country
export type CountryActiveClientUserActionWithCampaignType = {
  [SupportedCountryCodes.US]: USActiveClientUserActionWithCampaignType
  [SupportedCountryCodes.GB]: GBActiveClientUserActionWithCampaignType
  [SupportedCountryCodes.CA]: CAActiveClientUserActionWithCampaignType
  [SupportedCountryCodes.AU]: AUActiveClientUserActionWithCampaignType
}

export type ActiveClientUserActionWithCampaignType =
  CountryActiveClientUserActionWithCampaignType[SupportedCountryCodes]

export const COUNTRY_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN: {
  [key in SupportedCountryCodes]: readonly ActiveClientUserActionWithCampaignType[]
} = {
  [SupportedCountryCodes.US]: US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.GB]: GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.CA]: CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  [SupportedCountryCodes.AU]: AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
}

export type CountryUserActionCampaigns = {
  [SupportedCountryCodes.US]: USUserActionCampaigns
  [SupportedCountryCodes.GB]: GBUserActionCampaigns
  [SupportedCountryCodes.CA]: CAUserActionCampaigns
  [SupportedCountryCodes.AU]: AUUserActionCampaigns
}

export type UserActionCampaignNames =
  | USUserActionCampaigns[keyof USUserActionCampaigns]
  | GBUserActionCampaigns[keyof GBUserActionCampaigns]
  | CAUserActionCampaigns[keyof CAUserActionCampaigns]
  | AUUserActionCampaigns[keyof AUUserActionCampaigns]

export type UserActionCampaigns = CountryUserActionCampaigns[SupportedCountryCodes]

export const COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP: {
  [key in SupportedCountryCodes]: CountryUserActionCampaigns[key]
} = {
  [SupportedCountryCodes.US]: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.GB]: GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.CA]: CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  [SupportedCountryCodes.AU]: AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
}

export function isActionSupportedForCountry<
  Country extends SupportedCountryCodes,
  Action extends UserActionType,
>(country: Country, action: Action): action is Action & keyof CountryUserActionCampaigns[Country] {
  return (
    country in COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP &&
    action in COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[country]
  )
}

// For backwards compatibility
export const ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  ...US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  ...GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  ...CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  ...AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
]

// For backwards compatibility
export const USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  ...US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  ...GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  ...CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  ...AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
} satisfies Record<ActiveClientUserActionWithCampaignType, string>
