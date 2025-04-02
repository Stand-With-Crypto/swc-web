import { UserActionType } from '@prisma/client'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
] as const
export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum CAUserActionViewKeyRacesCampaignName {
  'H1_2025' = 'H1_2025',
}
export enum CAUserActionVoterAttestationCampaignName {
  'H1_2025' = 'H1_2025',
}

export type CAUserActionCampaignName =
  | CAUserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionReferCampaignName
  | CAUserActionViewKeyRacesCampaignName
  | CAUserActionVoterAttestationCampaignName

export type CAUserActionCampaigns = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.REFER]: CAUserActionReferCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: CAUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: CAUserActionReferCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName['H1_2025'],
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName['H1_2025'],
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
