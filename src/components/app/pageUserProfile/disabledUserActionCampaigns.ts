import { UserActionType } from '@prisma/client'

import {
  UserActionCallCampaignName,
  UserActionCampaigns,
  UserActionEmailCampaignName,
  UserActionLiveEventCampaignName,
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

// We have some duplicates here because email and call actions have the default campaign related to FIT21 as well as dedicated FIT21 campaigns.
// To fix this, we'll prob have to create a backfill script to update the corresponding user actions.
export const DISABLED_USER_ACTION_CAMPAIGNS: DisabledUserActionCampaigns = {
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.DEFAULT]: {
      title: 'FIT21 Email Campaign',
      subtitle: 'You emailed your representative and asked them to vote YES on FIT21.',
    },
    [UserActionEmailCampaignName.FIT21_2024_04]: {
      title: 'FIT21 Email Campaign',
      subtitle: 'You emailed your representative and asked them to vote YES on FIT21.',
    },
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
      title: 'CNN Presidential Debate 2024',
      subtitle: "You emailed CNN and asked them to include the candidates' stance on crypto.",
    },
    [UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP]: {
      title: 'FIT21 Email Follow Up Campaign',
      subtitle: 'You emailed your representative and thanked them for voting on FIT21.',
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
    [UserActionCallCampaignName.DEFAULT]: {
      title: 'FIT21 Call Campaign',
      subtitle: 'You called your representative and asked them to vote YES on FIT21.',
    },
  },
  [UserActionType.LIVE_EVENT]: {
    [UserActionLiveEventCampaignName['2024_03_04_LA']]: {
      title: 'GOTV Rally in Los Angeles - 2024',
      subtitle: 'You attended a get out the vote rally in Los Angeles.',
    },
  },
}
