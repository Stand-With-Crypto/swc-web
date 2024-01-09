import { UserActionType } from '@prisma/client'

export enum UserActionEmailCampaignName {
  DEFAULT = 'DEFAULT',
}
export enum UserActionCallCampaignName {
  DEFAULT = 'DEFAULT',
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

export const getDefaultEnumFromUserActionByActionType = (actionType: UserActionType) => {
  switch (actionType) {
    case UserActionType.EMAIL:
      return UserActionEmailCampaignName.DEFAULT
    case UserActionType.CALL:
      return UserActionCallCampaignName.DEFAULT
    case UserActionType.DONATION:
      return UserActionDonationCampaignName.DEFAULT
    case UserActionType.OPT_IN:
      return UserActionOptInCampaignName.DEFAULT
    case UserActionType.TWEET:
      return UserActionTweetCampaignName.DEFAULT
    case UserActionType.NFT_MINT:
      return UserActionNftMintCampaignName.DEFAULT
  }
}
