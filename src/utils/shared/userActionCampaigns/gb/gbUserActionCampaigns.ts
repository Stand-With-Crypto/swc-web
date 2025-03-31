import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.RSVP_EVENT,
] as const
export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export type GBUserActionCampaignName =
  | UserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionRsvpEventCampaignName

export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName.DEFAULT,
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
