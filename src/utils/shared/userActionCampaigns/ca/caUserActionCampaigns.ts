import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
] as const
export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionViewKeyRacesCampaignName {
  '2025_CA_ELECTIONS' = '2025_CA_ELECTIONS',
}

export enum CAUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export type CAUserActionCampaignName =
  | UserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionRsvpEventCampaignName
  | CAUserActionViewKeyRacesCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName['2025_CA_ELECTIONS'],
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
