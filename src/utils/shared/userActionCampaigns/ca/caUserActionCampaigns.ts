import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_PAGE,
] as const
export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionTweetCampaignName {
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

export type CAUserActionCampaignName =
  | UserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionReferCampaignName
  | CAUserActionRsvpEventCampaignName
  | CAUserActionViewKeyRacesCampaignName
  | CAUserActionVoterAttestationCampaignName
  | CAUserActionViewKeyPageCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.REFER]: CAUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: CAUserActionViewKeyPageCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: CAUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]: CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION,
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
