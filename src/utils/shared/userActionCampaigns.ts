import { UserActionType } from '@prisma/client'

export const ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
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
  UserActionType.POLL,
] as const
export type ActiveClientUserActionWithCampaignType =
  (typeof ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum UserActionEmailCampaignName {
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

// this seemingly random id is the id of the poll (in builder.io) that was used in the initial poll campaign
export enum UserActionPollCampaignName {
  ACTIVE_POLL_ID = 'b5d406a439734ae88e89de9c2d3803bb',
  INACTIVE_DEFAULT_INITIAL_POLL_ID = 'f82669b830d5475dae9e466a7c4598c7',
  INACTIVE_POLL_ID = 'f374e663801c435b9409a4606007f7ba',
}
export enum UserActionCallCampaignName {
  DEFAULT = 'CALL_YOUR_CONGRESSPERSON_FIT21',
  FIT21_2024_04 = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04',
}
export enum UserActionDonationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionOptInCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
  'FOLLOW_SWC_ON_X_2024' = 'FOLLOW_SWC_ON_X_2024',
}
export enum UserActionNftMintCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionVoterRegistrationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionLiveEventCampaignName {
  '2024_03_04_LA' = '2024_03_04_LA',
}
export enum UserActionTweetAtPersonCampaignName {
  DEFAULT = 'DEFAULT',
  '2024_05_22_PIZZA_DAY' = '2024_05_22_PIZZA_DAY',
}
export enum UserActionVoterAttestationCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionViewKeyRacesCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum UserActionVotingInformationResearchedCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}
export enum UserActionVotingDayCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
}

export enum UserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export type UserActionCampaignName =
  | UserActionEmailCampaignName
  | UserActionCallCampaignName
  | UserActionDonationCampaignName
  | UserActionOptInCampaignName
  | UserActionTweetCampaignName
  | UserActionNftMintCampaignName
  | UserActionVoterRegistrationCampaignName
  | UserActionLiveEventCampaignName
  | UserActionTweetAtPersonCampaignName
  | UserActionVoterAttestationCampaignName
  | UserActionViewKeyRacesCampaignName
  | UserActionVotingInformationResearchedCampaignName
  | UserActionVotingDayCampaignName
  | UserActionReferCampaignName
  | UserActionPollCampaignName

export type UserActionCampaigns = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName
  [UserActionType.CALL]: UserActionCallCampaignName
  [UserActionType.DONATION]: UserActionDonationCampaignName
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: UserActionTweetCampaignName
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName
  [UserActionType.TWEET_AT_PERSON]: UserActionTweetAtPersonCampaignName
  [UserActionType.VOTER_ATTESTATION]: UserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_RACES]: UserActionViewKeyRacesCampaignName
  [UserActionType.RSVP_EVENT]: UserActionRsvpEventCampaignName
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: UserActionVotingInformationResearchedCampaignName
  [UserActionType.VOTING_DAY]: UserActionVotingDayCampaignName
  [UserActionType.REFER]: UserActionReferCampaignName
  [UserActionType.POLL]: UserActionPollCampaignName
}

export const USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
  [UserActionType.CALL]: UserActionCallCampaignName.FIT21_2024_04,
  [UserActionType.DONATION]: UserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName.DEFAULT,
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: UserActionTweetAtPersonCampaignName.DEFAULT,
  [UserActionType.VOTER_ATTESTATION]: UserActionVoterAttestationCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: UserActionViewKeyRacesCampaignName['2024_ELECTION'],
  [UserActionType.RSVP_EVENT]: UserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VOTING_INFORMATION_RESEARCHED]:
    UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
  [UserActionType.VOTING_DAY]: UserActionVotingDayCampaignName['2024_ELECTION'],
  [UserActionType.REFER]: UserActionReferCampaignName.DEFAULT,
  [UserActionType.POLL]: UserActionPollCampaignName.ACTIVE_POLL_ID,
} satisfies Record<ActiveClientUserActionWithCampaignType, string>
