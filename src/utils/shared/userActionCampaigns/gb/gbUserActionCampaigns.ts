import { UserActionType } from '@prisma/client'

export const GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
] as const
export type GBActiveClientUserActionWithCampaignType =
  (typeof GB_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum GBUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum GBUserActionViewKeyRacesCampaignName {
  'H1_2025' = 'H1_2025',
}
export enum GBUserActionVoterAttestationCampaignName {
  'H1_2025' = 'H1_2025',
}
export type GBUserActionCampaignName =
  | GBUserActionOptInCampaignName
  | GBUserActionTweetCampaignName
  | GBUserActionViewKeyRacesCampaignName
  | GBUserActionVoterAttestationCampaignName
export type GBUserActionCampaigns = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName
  [UserActionType.TWEET]: GBUserActionTweetCampaignName
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName
}

export const GB_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: GBUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: GBUserActionTweetCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: GBUserActionViewKeyRacesCampaignName['H1_2025'],
  [UserActionType.VOTER_ATTESTATION]: GBUserActionVoterAttestationCampaignName['H1_2025'],
} satisfies Record<GBActiveClientUserActionWithCampaignType, string>
