import { UserActionType } from '@prisma/client'

export const AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
] as const
export type AUActiveClientUserActionWithCampaignType =
  (typeof AU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum AUUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum AUUserActionViewKeyRacesCampaignName {
  'H1_2025' = 'H1_2025',
}
export enum AUUserActionVoterAttestationCampaignName {
  'H1_2025' = 'H1_2025',
}

export type AUUserActionCampaignName =
  | AUUserActionOptInCampaignName
  | AUUserActionTweetCampaignName
  | AUUserActionViewKeyRacesCampaignName
  | AUUserActionVoterAttestationCampaignName

export type AUUserActionCampaigns = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName
  [UserActionType.TWEET]: AUUserActionTweetCampaignName
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName
}

export const AU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: AUUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: AUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: AUUserActionViewKeyRacesCampaignName['H1_2025'],
  [UserActionType.VOTER_ATTESTATION]: AUUserActionVoterAttestationCampaignName['H1_2025'],
} satisfies Record<AUActiveClientUserActionWithCampaignType, string>
