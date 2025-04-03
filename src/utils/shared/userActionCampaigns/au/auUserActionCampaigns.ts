import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_PAGE,
] as const
export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum AUUserActionViewKeyRacesCampaignName {
  H1_2025 = 'H1_2025',
}

export enum AUUserActionVoterAttestationCampaignName {
  H1_2025 = 'H1_2025',
}

export enum AUUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum AUUserActionViewKeyPageCampaignName {
  NEWMODE_EMAIL_ACTION = 'NEWMODE_EMAIL_ACTION',
}

export type AUUserActionCampaignName =
  | UserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionRsvpEventCampaignName
  | AUUserActionViewKeyRacesCampaignName
  | AUUserActionVoterAttestationCampaignName
  | AUUserActionViewKeyPageCampaignName

export type AUUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: AUUserActionViewKeyPageCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]: AUUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION,
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
