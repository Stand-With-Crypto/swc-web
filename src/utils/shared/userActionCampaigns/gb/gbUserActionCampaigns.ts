import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.REFER,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_PAGE,
  UserActionType.POLL,
] as const

export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionLinkedInCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum GBUserActionViewKeyRacesCampaignName {
  H1_2025 = 'H1_2025',
}

export enum GBUserActionVoterAttestationCampaignName {
  H1_2025 = 'H1_2025',
}

export enum GBUserActionViewKeyPageCampaignName {
  NEWMODE_EMAIL_ACTION = 'NEWMODE_EMAIL_ACTION',
}

export enum GBUserActionPollCampaignName {
  CRYPTO_NEWS = '62781aa7423a40e4a013340e0732d454',
  DIGITAL_ASSETS = '7cbd05a756084a908b447e75de194aa2',
  ENCOURAGE = '71c9f42180414e87b6bc362e630e710c',
}

export type GBUserActionCampaignName =
  | UserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionLinkedInCampaignName
  | GBUserActionReferCampaignName
  | GBUserActionRsvpEventCampaignName
  | GBUserActionViewKeyRacesCampaignName
  | GBUserActionVoterAttestationCampaignName
  | GBUserActionViewKeyPageCampaignName
  | GBUserActionPollCampaignName

export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.LINKEDIN]: GBUserActionLinkedInCampaignName
  [UserActionType.REFER]: GBUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: GBUserActionViewKeyPageCampaignName
  [UserActionType.POLL]: GBUserActionPollCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: GBUserActionLinkedInCampaignName.DEFAULT,
  [UserActionType.REFER]: GBUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: GBUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]: GBUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION,
  [UserActionType.POLL]: GBUserActionPollCampaignName.CRYPTO_NEWS,
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
