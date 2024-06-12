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
] as const
export type ActiveClientUserActionWithCampaignType =
  (typeof ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum UserActionEmailCampaignName {
  DEFAULT = 'EMAIL_YOUR_CONGRESSPERSON_FIT21',
  FIT21_2024_04 = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04',
  FIT21_2024_04_FOLLOW_UP = 'EMAIL_YOUR_CONGRESSPERSON_FIT21_2024_04_FOLLOW_UP',
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

export type UserActionCampaigns =
  | UserActionEmailCampaignName
  | UserActionCallCampaignName
  | UserActionDonationCampaignName
  | UserActionOptInCampaignName
  | UserActionTweetCampaignName
  | UserActionNftMintCampaignName
  | UserActionVoterRegistrationCampaignName
  | UserActionLiveEventCampaignName
  | UserActionTweetAtPersonCampaignName

export const USER_ACTION_TO_CAMPAIGN_NAME_MAP = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName,
  [UserActionType.CALL]: UserActionCallCampaignName,
  [UserActionType.DONATION]: UserActionDonationCampaignName,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName,
  [UserActionType.TWEET]: UserActionTweetCampaignName,
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName,
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName,
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName,
  [UserActionType.TWEET_AT_PERSON]: UserActionTweetAtPersonCampaignName,
} satisfies Record<ActiveClientUserActionWithCampaignType, any>

export const USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
  [UserActionType.CALL]: UserActionCallCampaignName.FIT21_2024_04,
  [UserActionType.DONATION]: UserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: UserActionTweetCampaignName.DEFAULT,
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName.DEFAULT,
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName['2024_03_04_LA'],
  [UserActionType.TWEET_AT_PERSON]: UserActionTweetAtPersonCampaignName.DEFAULT,
} satisfies Record<ActiveClientUserActionWithCampaignType, string>

type UserActionAdditionalCampaigns = {
  [key in UserActionType]: string[]
}

export const USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN: Partial<UserActionAdditionalCampaigns> = {
  [UserActionType.EMAIL]: [UserActionEmailCampaignName.DEFAULT], // This will be changed to CNN campaign later
}
