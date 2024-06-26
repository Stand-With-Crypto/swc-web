import { UserActionType } from '@prisma/client'

import {
  UserActionCallCampaignName,
  UserActionCampaigns,
  UserActionEmailCampaignName,
  UserActionTweetAtPersonCampaignName,
} from '@/utils/shared/userActionCampaigns'

type DisabledUserActionCampaigns = {
  [K in keyof UserActionCampaigns]?: {
    [Key in UserActionCampaigns[K]]?: {
      title: string
      subtitle: string
    }
  }
}

export const DISABLED_USER_ACTION_CAMPAIGNS: DisabledUserActionCampaigns = {
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.FIT21_2024_04]: {
      title: 'FIT21 Email Campaign',
      subtitle: 'You emailed your representative and asked them to vote YES on FIT21.',
    },
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
      title: 'CNN Presidential Debate 2024',
      subtitle: "You emailed CNN and asked them to include the candidates' stance on crypto.",
    },
  },
  [UserActionType.TWEET_AT_PERSON]: {
    [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: {
      title: 'Pizza Day 2024',
      subtitle: 'You tweeted your representative for pizza day.',
    },
  },
  [UserActionType.CALL]: {
    [UserActionCallCampaignName.FIT21_2024_04]: {
      title: 'FIT21 Call Campaign',
      subtitle: 'You called your representative and asked them to vote YES on FIT21.',
    },
  },
}
