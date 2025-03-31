import { UserActionType } from '@prisma/client'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.VIEW_KEY_RACES,
] as const
export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionViewKeyRacesCampaignName {
  '2025_CA_ELECTIONS' = '2025_CA_ELECTIONS',
}

export type CAUserActionCampaignName =
  | CAUserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionViewKeyRacesCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName['2025_CA_ELECTIONS'],
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
