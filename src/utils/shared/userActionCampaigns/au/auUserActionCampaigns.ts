import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.REFER,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_PAGE,
  UserActionType.POLL,
  UserActionType.EMAIL,
] as const

export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum AUUserActionLinkedInCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum AUUserActionReferCampaignName {
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
  AU_Q2_2025_ELECTION = 'AU_Q2_2025_ELECTION',
  AU_NEWMODE_DEBANKING = 'AU_NEWMODE_DEBANKING',
}

export enum AUUserActionPollCampaignName {
  CRYPTO_NEWS = '0703f9442c8c4bedb12375d213aaef21',
  DIGITAL_ASSETS = 'd77dded618334e18b77b526587dd7532',
  ENCOURAGE = 'f6d5d046ba4240598912b7d8be539bd3',
}

export enum AUUserActionEmailCampaignName {
  DEFAULT = 'DEFAULT',
  AU_Q2_2025_ELECTION = 'AU_Q2_2025_ELECTION',
  AU_NEWMODE_DEBANKING = 'AU_NEWMODE_DEBANKING',
}

export type AUUserActionCampaignName =
  | UserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionLinkedInCampaignName
  | AUUserActionReferCampaignName
  | AUUserActionRsvpEventCampaignName
  | AUUserActionViewKeyRacesCampaignName
  | AUUserActionVoterAttestationCampaignName
  | AUUserActionViewKeyPageCampaignName
  | AUUserActionPollCampaignName
  | AUUserActionEmailCampaignName

export interface AUUserActionCampaigns {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.LINKEDIN]: AUUserActionLinkedInCampaignName
  [UserActionType.REFER]: AUUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: AUUserActionViewKeyPageCampaignName
  [UserActionType.POLL]: AUUserActionPollCampaignName
  [UserActionType.EMAIL]: AUUserActionEmailCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: AUUserActionLinkedInCampaignName.DEFAULT,
  [UserActionType.REFER]: AUUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: AUUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]: AUUserActionViewKeyPageCampaignName.AU_Q2_2025_ELECTION,
  [UserActionType.POLL]: AUUserActionPollCampaignName.CRYPTO_NEWS,
  [UserActionType.EMAIL]: AUUserActionEmailCampaignName.DEFAULT,
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
