import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
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

export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionLinkedInCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionViewKeyRacesCampaignName {
  H1_2025 = 'H1_2025',
}

export enum CAUserActionVoterAttestationCampaignName {
  H1_2025 = 'H1_2025',
}

export enum CAUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionViewKeyPageCampaignName {
  CA_Q2_2025_ELECTION = 'CA_Q2_2025_ELECTION',
  CA_NEWMODE_DEBANKING = 'CA_NEWMODE_DEBANKING',
}

export enum CAUserActionPollCampaignName {
  CRYPTO_NEWS = '1457fc9c45ca474bb92487ad29878d05',
  DIGITAL_ASSETS = '9158179a1f4741e3b41c66263f5d2790',
  ENCOURAGE = '2df3e725d2b94b7c8c5740f85cdbcb3c',
}

export type CAUserActionCampaignName =
  | UserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionLinkedInCampaignName
  | CAUserActionReferCampaignName
  | CAUserActionRsvpEventCampaignName
  | CAUserActionViewKeyRacesCampaignName
  | CAUserActionVoterAttestationCampaignName
  | CAUserActionViewKeyPageCampaignName
  | CAUserActionPollCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.LINKEDIN]: CAUserActionLinkedInCampaignName
  [UserActionType.REFER]: CAUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: CAUserActionViewKeyPageCampaignName
  [UserActionType.POLL]: CAUserActionPollCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: CAUserActionLinkedInCampaignName.DEFAULT,
  [UserActionType.REFER]: CAUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]: CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION,
  [UserActionType.POLL]: CAUserActionPollCampaignName.CRYPTO_NEWS,
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
