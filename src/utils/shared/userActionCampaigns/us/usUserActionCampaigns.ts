import { UserActionType } from '@prisma/client'

export const US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
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
export type USActiveClientUserActionWithCampaignType =
  (typeof US_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum USUserActionEmailCampaignName {
  DEFAULT = 'EMAIL_YOUR_CONGRESSPERSON_FIT21',
  FIT21_2024_04 = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04',
  FIT21_2024_04_FOLLOW_UP = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04_FOLLOW_UP',
  CNN_PRESIDENTIAL_DEBATE_2024 = 'CNN_PRESIDENTIAL_DEBATE_2024',
  ABC_PRESIDENTIAL_DEBATE_2024 = 'ABC_PRESIDENTIAL_DEBATE_2024',
  SEC_COMMISSIONER_2024 = 'SEC_COMMISSIONER_2024',
  WELCOME_119_CONGRESS_2025 = 'WELCOME_119_CONGRESS_2025',
  BROKER_REPORTING_RULE_SJ_RES_3 = 'BROKER_REPORTING_RULE_SJ_RES_3',
  BROKER_REPORTING_RULE_SJ_RES_3_MARCH_3RD = 'BROKER_REPORTING_RULE_SJ_RES_3_MARCH_3RD',
  BROKER_REPORTING_RULE_SJ_RES_3_MARCH_10TH = 'BROKER_REPORTING_RULE_SJ_RES_3_MARCH_10TH',
}
export enum USUserActionCallCampaignName {
  DEFAULT = 'CALL_YOUR_CONGRESSPERSON_FIT21',
  FIT21_2024_04 = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04',
}
export enum USUserActionDonationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
  'FOLLOW_SWC_ON_X_2024' = 'FOLLOW_SWC_ON_X_2024',
}
export enum USUserActionNftMintCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionVoterRegistrationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionLiveEventCampaignName {
  '2024_03_04_LA' = '2024_03_04_LA',
}
export enum USUserActionTweetAtPersonCampaignName {
  DEFAULT = 'DEFAULT',
  '2024_05_22_PIZZA_DAY' = '2024_05_22_PIZZA_DAY',
}
export enum USUserActionVoterAttestationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionViewKeyRacesCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum USUserActionVotingInformationResearchedCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum USUserActionVotingDayCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}

export enum USUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export type USUserActionCampaignName =
  | USUserActionEmailCampaignName
  | USUserActionCallCampaignName
  | USUserActionDonationCampaignName
  | USUserActionOptInCampaignName
  | USUserActionTweetCampaignName
  | USUserActionNftMintCampaignName
  | USUserActionVoterRegistrationCampaignName
  | USUserActionLiveEventCampaignName
  | USUserActionTweetAtPersonCampaignName
  | USUserActionVoterAttestationCampaignName
  | USUserActionViewKeyRacesCampaignName
  | USUserActionVotingInformationResearchedCampaignName
  | USUserActionVotingDayCampaignName
  | USUserActionReferCampaignName

export type USUserActionCampaigns = {
  [UserActionType.EMAIL]: USUserActionEmailCampaignName
  [UserActionType.CALL]: USUserActionCallCampaignName
  [UserActionType.DONATION]: USUserActionDonationCampaignName
  [UserActionType.OPT_IN]: USUserActionOptInCampaignName
  [UserActionType.TWEET]: USUserActionTweetCampaignName
  [UserActionType.NFT_MINT]: USUserActionNftMintCampaignName
  [UserActionType.VOTER_REGISTRATION]: USUserActionVoterRegistrationCampaignName
  [UserActionType.LIVE_EVENT]: USUserActionLiveEventCampaignName
  [UserActionType.TWEET_AT_PERSON]: USUserActionTweetAtPersonCampaignName
  [UserActionType.VOTER_ATTESTATION]: USUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_RACES]: USUserActionViewKeyRacesCampaignName
  [UserActionType.RSVP_EVENT]: USUserActionRsvpEventCampaignName
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: USUserActionVotingInformationResearchedCampaignName
  [UserActionType.VOTING_DAY]: USUserActionVotingDayCampaignName
  [UserActionType.REFER]: USUserActionReferCampaignName
}

export const US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: USUserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
  [UserActionType.CALL]: USUserActionCallCampaignName.FIT21_2024_04,
  [UserActionType.DONATION]: USUserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: USUserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
  [UserActionType.NFT_MINT]: USUserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: USUserActionVoterRegistrationCampaignName.DEFAULT,
  [UserActionType.LIVE_EVENT]: USUserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: USUserActionTweetAtPersonCampaignName.DEFAULT,
  [UserActionType.VOTER_ATTESTATION]: USUserActionVoterAttestationCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: USUserActionViewKeyRacesCampaignName['2024_ELECTION'],
  [UserActionType.RSVP_EVENT]: USUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VOTING_INFORMATION_RESEARCHED]:
    USUserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
  [UserActionType.VOTING_DAY]: USUserActionVotingDayCampaignName['2024_ELECTION'],
  [UserActionType.REFER]: USUserActionReferCampaignName.DEFAULT,
} satisfies Record<USActiveClientUserActionWithCampaignType, string>
