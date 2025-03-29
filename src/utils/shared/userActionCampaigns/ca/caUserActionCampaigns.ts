import { UserActionType } from '@prisma/client'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
] as const
export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export type CAUserActionCampaignName = CAUserActionOptInCampaignName | CAUserActionTweetCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
