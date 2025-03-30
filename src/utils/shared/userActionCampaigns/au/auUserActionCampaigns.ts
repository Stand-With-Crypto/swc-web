import { UserActionType } from '@prisma/client'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
] as const
export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export type AUUserActionCampaignName =
  | AUUserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionReferCampaignName

export type AUUserActionCampaigns = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.REFER]: AUUserActionReferCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: AUUserActionReferCampaignName.DEFAULT,
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
