import { UserActionType } from '@prisma/client'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
] as const
export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export type GBUserActionCampaignName =
  | GBUserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionReferCampaignName

export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.REFER]: GBUserActionReferCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: GBUserActionReferCampaignName.DEFAULT,
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
