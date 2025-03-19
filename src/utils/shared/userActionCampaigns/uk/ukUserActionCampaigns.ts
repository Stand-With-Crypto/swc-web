import { UserActionType } from '@prisma/client'

export const UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
  UserActionType.LIVE_EVENT,
  UserActionType.TWEET_AT_PERSON,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTING_INFORMATION_RESEARCHED,
  UserActionType.VOTING_DAY,
  UserActionType.REFER,
] as const
export type UKActiveClientUserActionWithCampaignType =
  (typeof UK_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum UKUserActionEmailCampaignName {
  DEFAULT = 'EMAIL_YOUR_CONGRESSPERSON_FIT21',
}
export enum UKUserActionCallCampaignName {
  DEFAULT = 'CALL_YOUR_CONGRESSPERSON_FIT21',
}
export enum UKUserActionDonationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionNftMintCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionVoterRegistrationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionLiveEventCampaignName {
  '2024_03_04_LA' = '2024_03_04_LA',
}
export enum UKUserActionTweetAtPersonCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionVoterAttestationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UKUserActionViewKeyRacesCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum UKUserActionVotingInformationResearchedCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum UKUserActionVotingDayCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum UKUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
  TEST = 'TEST',
}

export type UKUserActionCampaignName =
  | UKUserActionEmailCampaignName
  | UKUserActionCallCampaignName
  | UKUserActionDonationCampaignName
  | UKUserActionOptInCampaignName
  | UKUserActionTweetCampaignName
  | UKUserActionNftMintCampaignName
  | UKUserActionVoterRegistrationCampaignName
  | UKUserActionLiveEventCampaignName
  | UKUserActionTweetAtPersonCampaignName
  | UKUserActionVoterAttestationCampaignName
  | UKUserActionViewKeyRacesCampaignName
  | UKUserActionVotingInformationResearchedCampaignName
  | UKUserActionVotingDayCampaignName
  | UKUserActionReferCampaignName

export type UKUserActionCampaigns = {
  [UserActionType.EMAIL]: UKUserActionEmailCampaignName
  [UserActionType.CALL]: UKUserActionCallCampaignName
  [UserActionType.DONATION]: UKUserActionDonationCampaignName
  [UserActionType.OPT_IN]: UKUserActionOptInCampaignName
  [UserActionType.TWEET]: UKUserActionTweetCampaignName
  [UserActionType.NFT_MINT]: UKUserActionNftMintCampaignName
  [UserActionType.VOTER_REGISTRATION]: UKUserActionVoterRegistrationCampaignName
  [UserActionType.LIVE_EVENT]: UKUserActionLiveEventCampaignName
  [UserActionType.TWEET_AT_PERSON]: UKUserActionTweetAtPersonCampaignName
  [UserActionType.VOTER_ATTESTATION]: UKUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_RACES]: UKUserActionViewKeyRacesCampaignName
  [UserActionType.RSVP_EVENT]: UKUserActionRsvpEventCampaignName
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: UKUserActionVotingInformationResearchedCampaignName
  [UserActionType.VOTING_DAY]: UKUserActionVotingDayCampaignName
  [UserActionType.REFER]: UKUserActionReferCampaignName
}

export const UK_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: UKUserActionEmailCampaignName.DEFAULT,
  [UserActionType.CALL]: UKUserActionCallCampaignName.DEFAULT,
  [UserActionType.DONATION]: UKUserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: UKUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: UKUserActionTweetCampaignName.DEFAULT,
  [UserActionType.NFT_MINT]: UKUserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: UKUserActionVoterRegistrationCampaignName.DEFAULT,
  [UserActionType.LIVE_EVENT]: UKUserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: UKUserActionTweetAtPersonCampaignName.DEFAULT,
  [UserActionType.VOTER_ATTESTATION]: UKUserActionVoterAttestationCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: UKUserActionViewKeyRacesCampaignName['2024_ELECTION'],
  [UserActionType.RSVP_EVENT]: UKUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VOTING_INFORMATION_RESEARCHED]:
    UKUserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
  [UserActionType.VOTING_DAY]: UKUserActionVotingDayCampaignName['2024_ELECTION'],
  [UserActionType.REFER]: UKUserActionReferCampaignName.DEFAULT,
} satisfies Record<UKActiveClientUserActionWithCampaignType, string>
