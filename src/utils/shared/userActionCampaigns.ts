import { UserActionType } from '@prisma/client'

export enum UserActionEmailCampaignName {
  DEFAULT = 'EMAIL_YOUR_CONGRESSPERSON_FIT21',
}
export enum UserActionCallCampaignName {
  DEFAULT = 'CALL_YOUR_CONGRESSPERSON_FIT21',
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

export const USER_ACTION_TO_CAMPAIGN_NAME_MAP = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName,
  [UserActionType.CALL]: UserActionCallCampaignName,
  [UserActionType.DONATION]: UserActionDonationCampaignName,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName,
  [UserActionType.TWEET]: UserActionTweetCampaignName,
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName,
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName,
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName,
} satisfies Record<UserActionType, any>

export const USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.EMAIL]: UserActionEmailCampaignName.DEFAULT,
  [UserActionType.CALL]: UserActionCallCampaignName.DEFAULT,
  [UserActionType.DONATION]: UserActionDonationCampaignName.DEFAULT,
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: UserActionTweetCampaignName.DEFAULT,
  [UserActionType.NFT_MINT]: UserActionNftMintCampaignName.DEFAULT,
  [UserActionType.VOTER_REGISTRATION]: UserActionVoterRegistrationCampaignName.DEFAULT,
  [UserActionType.LIVE_EVENT]: UserActionLiveEventCampaignName['2024_03_04_LA'],
} satisfies Record<UserActionType, string>
