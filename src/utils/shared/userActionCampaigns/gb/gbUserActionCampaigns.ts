import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
] as const
export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionViewKeyRacesCampaignName {
  'H1_2025' = 'H1_2025',
}
export enum GBUserActionVoterAttestationCampaignName {
  'H1_2025' = 'H1_2025',
}

export type GBUserActionCampaignName =
  | UserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionReferCampaignName
  | GBUserActionRsvpEventCampaignName
  | GBUserActionViewKeyRacesCampaignName
  | GBUserActionVoterAttestationCampaignName

export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.REFER]: GBUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: GBUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName['H1_2025'],
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName['H1_2025'],
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
