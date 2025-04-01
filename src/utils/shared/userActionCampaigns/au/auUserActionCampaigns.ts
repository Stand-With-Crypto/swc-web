import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
] as const
export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionViewKeyRacesCampaignName {
  '2025_AU_ELECTIONS' = '2025_AU_ELECTIONS',
}

export enum AUUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export type AUUserActionCampaignName =
  | UserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionRsvpEventCampaignName
  | AUUserActionViewKeyRacesCampaignName

export type AUUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName['2025_AU_ELECTIONS'],
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
