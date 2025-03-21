import { UserActionType } from '@prisma/client'

export const UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
] as const
export type UKActiveClientUserActionWithCampaignType =
  (typeof UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum UKUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export type UKUserActionCampaignName = UKUserActionOptInCampaignName | UKUserActionTweetCampaignName

export type UKUserActionCampaigns = {
  [UserActionType.OPT_IN]: UKUserActionOptInCampaignName
  [UserActionType.TWEET]: UKUserActionTweetCampaignName
}

export const UK_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UKUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: UKUserActionTweetCampaignName.DEFAULT,
} satisfies Record<UKActiveClientUserActionWithCampaignType, string>
