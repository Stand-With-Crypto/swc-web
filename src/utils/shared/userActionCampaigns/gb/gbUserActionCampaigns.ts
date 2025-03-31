import { UserActionType } from '@prisma/client'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.VIEW_KEY_RACES,
] as const
export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionViewKeyRacesCampaignName {
  '2025_GB_ELECTIONS' = '2025_GB_ELECTIONS',
}
export type GBUserActionCampaignName =
  | GBUserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionViewKeyRacesCampaignName

export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName['2025_GB_ELECTIONS'],
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
