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
  CRYPTO_NEWS = '13ba79f9884342a39e1f8825a68bf6e6',
  DIGITAL_ASSETS = '83cfa60cf9f54b28836635dc7ce7f3b9',
  ENCOURAGE = '063780ccc6094b83935b8cb49dcc6bdd',
  OVAL_OFFICE = 'c5b32ae0dce44b1780bedd9a8c905e67',
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
  '2025_US_ELECTIONS' = '2025_US_ELECTIONS',
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
  '2025_US_ELECTIONS' = '2025_US_ELECTIONS',
  '2025_AU_ELECTIONS' = '2025_AU_ELECTIONS',
  '2025_GB_ELECTIONS' = '2025_GB_ELECTIONS',
  '2025_CA_ELECTIONS' = '2025_CA_ELECTIONS',
}
export enum UserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionViewKeyRacesCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  '2025_US_ELECTIONS' = '2025_US_ELECTIONS',
}
export enum UserActionVotingInformationResearchedCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  '2025_US_ELECTIONS' = '2025_US_ELECTIONS',
}
export enum UserActionVotingDayCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  '2025_US_ELECTIONS' = '2025_US_ELECTIONS',
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
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName['2025_US_ELECTIONS'],
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: UserActionTweetAtPersonCampaignName.DEFAULT,
  [UserActionType.VOTER_ATTESTATION]: UserActionVoterAttestationCampaignName['2025_US_ELECTIONS'],
  [UserActionType.VIEW_KEY_RACES]: UserActionViewKeyRacesCampaignName['2025_US_ELECTIONS'],
  [UserActionType.RSVP_EVENT]: UserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VOTING_INFORMATION_RESEARCHED]:
    UserActionVotingInformationResearchedCampaignName['2025_US_ELECTIONS'],
  [UserActionType.VOTING_DAY]: UserActionVotingDayCampaignName['2025_US_ELECTIONS'],
  [UserActionType.REFER]: UserActionReferCampaignName.DEFAULT,
  [UserActionType.POLL]: UserActionPollCampaignName.CRYPTO_NEWS,
} satisfies Record<ActiveClientUserActionWithCampaignType, string>
