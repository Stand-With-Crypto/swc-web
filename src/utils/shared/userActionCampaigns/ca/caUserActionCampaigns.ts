import { UserActionType } from '@prisma/client'

import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.REFER,
  UserActionType.RSVP_EVENT,
  UserActionType.VIEW_KEY_RACES,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VIEW_KEY_PAGE,
  UserActionType.POLL,
  UserActionType.EMAIL,
] as const

export type CAActiveClientUserActionWithCampaignType =
  (typeof CA_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN)[number]

export enum CAUserActionTweetCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionLinkedInCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionReferCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionViewKeyRacesCampaignName {
  H1_2025 = 'H1_2025',
}

export enum CAUserActionVoterAttestationCampaignName {
  H1_2025 = 'H1_2025',
}

export enum CAUserActionRsvpEventCampaignName {
  DEFAULT = 'DEFAULT',
}

export enum CAUserActionViewKeyPageCampaignName {
  CA_Q2_2025_ELECTION = 'CA_Q2_2025_ELECTION',
  CA_NEWMODE_DEBANKING = 'CA_NEWMODE_DEBANKING',
  CA_MOMENTUM_AHEAD_HOUSE_RISING = 'CA_MOMENTUM_AHEAD_HOUSE_RISING',
}

export enum CAUserActionPollCampaignName {
  CRYPTO_NEWS = '1457fc9c45ca474bb92487ad29878d05',
  DIGITAL_ASSETS = '9158179a1f4741e3b41c66263f5d2790',
  ENCOURAGE = '2df3e725d2b94b7c8c5740f85cdbcb3c',
  CA_PRECISION_AUG25_INTEREST = '8c235779b24c4b10b258447f85a4c936',
  CA_PRECISION_AUG25_COMP = 'b551b33c944d41b5a35479107d5d2358',
  CA_PRECISION_AUG25_CAREERS = 'bc11798acb654004a644f90c6aea29dd',
  CA_PRECISION_AUG25_GOV1 = '402837e5a04b4c4693b58a572346eb62',
  CA_PRECISION_AUG25_GOV2 = '381316a5f78e42d59d2581be7458517f',
  CA_PRECISION_AUG25_USECASE = '30cccdff02744c068e7f7c294d208d0f',
  CA_PRECISION_AUG25_POLICYPRIO = 'f177618dd94548afb7155020b58e9428',
  CA_PRECISION_AUG25_CASTABLE = '5d0b20f7969c4d6f9d797303e7aa273d',
}

export enum CAUserActionEmailCampaignName {
  DEFAULT = 'DEFAULT',
  CA_MOMENTUM_AHEAD_HOUSE_RISING = 'CA_MOMENTUM_AHEAD_HOUSE_RISING',
}

export type CAUserActionCampaignName =
  | UserActionOptInCampaignName
  | CAUserActionTweetCampaignName
  | CAUserActionLinkedInCampaignName
  | CAUserActionReferCampaignName
  | CAUserActionRsvpEventCampaignName
  | CAUserActionViewKeyRacesCampaignName
  | CAUserActionVoterAttestationCampaignName
  | CAUserActionViewKeyPageCampaignName
  | CAUserActionPollCampaignName
  | CAUserActionEmailCampaignName

export interface CAUserActionCampaigns {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName
  [UserActionType.TWEET]: CAUserActionTweetCampaignName
  [UserActionType.LINKEDIN]: CAUserActionLinkedInCampaignName
  [UserActionType.REFER]: CAUserActionReferCampaignName
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName
  [UserActionType.VIEW_KEY_PAGE]: CAUserActionViewKeyPageCampaignName
  [UserActionType.POLL]: CAUserActionPollCampaignName
  [UserActionType.EMAIL]: CAUserActionEmailCampaignName
}

export const CA_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP = {
  [UserActionType.OPT_IN]: UserActionOptInCampaignName.DEFAULT,
  [UserActionType.TWEET]: CAUserActionTweetCampaignName.DEFAULT,
  [UserActionType.LINKEDIN]: CAUserActionLinkedInCampaignName.DEFAULT,
  [UserActionType.REFER]: CAUserActionReferCampaignName.DEFAULT,
  [UserActionType.RSVP_EVENT]: CAUserActionRsvpEventCampaignName.DEFAULT,
  [UserActionType.VIEW_KEY_RACES]: CAUserActionViewKeyRacesCampaignName.H1_2025,
  [UserActionType.VOTER_ATTESTATION]: CAUserActionVoterAttestationCampaignName.H1_2025,
  [UserActionType.VIEW_KEY_PAGE]:
    CAUserActionViewKeyPageCampaignName.CA_MOMENTUM_AHEAD_HOUSE_RISING,
  [UserActionType.POLL]: CAUserActionPollCampaignName.CRYPTO_NEWS,
  [UserActionType.EMAIL]: CAUserActionEmailCampaignName.DEFAULT,
} satisfies Record<CAActiveClientUserActionWithCampaignType, string>
