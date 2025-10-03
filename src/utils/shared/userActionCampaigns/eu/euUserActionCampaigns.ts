import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const EU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.REFER,
  // TODO(EU): Add more action types when EU campaigns are implemented
] as const

export type EUActiveClientUserActionWithCampaignType =
  (typeof EU_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum EUUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum EUUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum EUUserActionLinkedInCampaignName {
  DEFAULT = 'DEFAULT',
}

// TODO(EU): Add EU-specific campaign enums when needed
export type EUUserActionEmailCampaignName = string

export enum EUUserActionSignPetitionCampaignName {
  // TODO(EU): Add EU-specific campaigns
  DEFAULT = 'DEFAULT',
}

export interface EUUserActionCampaigns {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: EUUserActionTweetCampaignName
  [UserActionType.REFER]: EUUserActionReferCampaignName
  [UserActionType.LINKEDIN]: EUUserActionLinkedInCampaignName
  // TODO(EU): Add more action types when campaigns are implemented
  [UserActionType.SIGN_PETITION]: EUUserActionSignPetitionCampaignName
}

export const EU_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP: EUUserActionCampaigns = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: EUUserActionTweetCampaignName.DEFAULT,
  [UserActionType.REFER]: EUUserActionReferCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: EUUserActionLinkedInCampaignName.DEFAULT,
  // TODO(EU): Add more mappings when campaigns are implemented
  [UserActionType.SIGN_PETITION]: EUUserActionSignPetitionCampaignName.DEFAULT,
}
