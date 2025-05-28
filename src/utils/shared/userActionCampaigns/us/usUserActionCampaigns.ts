import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

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
  UserActionType.POLL,
  UserActionType.VIEW_KEY_PAGE,
  UserActionType.LINKEDIN,
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
  GENIUS_ACT_8_MAY_2025 = 'GENIUS_ACT_8_MAY_2025',
  GENIUS_ACT_MAY_13_2025 = 'GENIUS_ACT_MAY_13_2025',
  FOUNDERS_PUSH_MAY_14_2025 = 'FOUNDERS_PUSH_MAY_14_2025',
}

// this seemingly random id is the id of the poll (in builder.io) that was used in the initial poll campaign
export enum USUserActionPollCampaignName {
  CRYPTO_NEWS = '13ba79f9884342a39e1f8825a68bf6e6',
  DIGITAL_ASSETS = '83cfa60cf9f54b28836635dc7ce7f3b9',
  ENCOURAGE = '063780ccc6094b83935b8cb49dcc6bdd',
  OVAL_OFFICE = 'c5b32ae0dce44b1780bedd9a8c905e67',
}
export enum USUserActionCallCampaignName {
  DEFAULT = 'CALL_YOUR_CONGRESSPERSON_FIT21',
  FIT21_2024_04 = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04',
}
export enum USUserActionDonationCampaignName {
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
  'H1_2025' = 'H1_2025',
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
  'H1_2025' = 'H1_2025',
}
export enum USUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionViewKeyRacesCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  'H1_2025' = 'H1_2025',
}
export enum USUserActionVotingInformationResearchedCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  'H1_2025' = 'H1_2025',
}
export enum USUserActionVotingDayCampaignName {
  '2024_ELECTION' = '2024_ELECTION',
  'H1_2025' = 'H1_2025',
}
export enum USUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionViewKeyPageCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum USUserActionLinkedinCampaignName {
  DEFAULT = 'DEFAULT',
}

export type USUserActionCampaignName =
  | USUserActionEmailCampaignName
  | USUserActionCallCampaignName
  | USUserActionDonationCampaignName
  | UserActionOptInCampaignName
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
  | USUserActionPollCampaignName
  | USUserActionLinkedinCampaignName
export interface USUserActionCampaigns {
  [UserActionType.EMAIL]: USUserActionEmailCampaignName
  [UserActionType.CALL]: USUserActionCallCampaignName
  [UserActionType.DONATION]: USUserActionDonationCampaignName
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
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
  [UserActionType.POLL]: USUserActionPollCampaignName
  [UserActionType.VIEW_KEY_PAGE]: USUserActionViewKeyPageCampaignName
  [UserActionType.LINKEDIN]: USUserActionLinkedinCampaignName
}

export const US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: USUserActionEmailCampaignName.GENIUS_ACT_8_MAY_2025,
  [UserActionType.CALL]: USUserActionCallCampaignName.FIT21_2024_04,
  [UserActionType.DONATION]: USUserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
  [UserActionType.NFT_MINT]: USUserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: USUserActionVoterRegistrationCampaignName['H1_2025'],
  [UserActionType.LIVE_EVENT]: USUserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: USUserActionTweetAtPersonCampaignName.DEFAULT,
  [UserActionType.VOTER_ATTESTATION]: USUserActionVoterAttestationCampaignName['H1_2025'],
  [UserActionType.VIEW_KEY_RACES]: USUserActionViewKeyRacesCampaignName['H1_2025'],
  [UserActionType.RSVP_EVENT]: USUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VOTING_INFORMATION_RESEARCHED]:
    USUserActionVotingInformationResearchedCampaignName['H1_2025'],
  [UserActionType.VOTING_DAY]: USUserActionVotingDayCampaignName['H1_2025'],
  [UserActionType.REFER]: USUserActionReferCampaignName.DEFAULT,
  [UserActionType.POLL]: USUserActionPollCampaignName.CRYPTO_NEWS,
  [UserActionType.VIEW_KEY_PAGE]: USUserActionViewKeyPageCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: USUserActionLinkedinCampaignName.DEFAULT,
} satisfies Record<USActiveClientUserActionWithCampaignType, string>
