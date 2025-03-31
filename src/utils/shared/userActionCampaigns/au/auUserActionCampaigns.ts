import { UserActionType } from '@prisma/client'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.VIEW_KEY_RACES,
] as const
export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionViewKeyRacesCampaignName {
  '2025_AU_ELECTIONS' = '2025_AU_ELECTIONS',
}

export type AUUserActionCampaignName =
  | AUUserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionViewKeyRacesCampaignName

export type AUUserActionCampaigns = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName['2025_AU_ELECTIONS'],
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
