import { UserActionType } from '@prisma/client'

import {
  UserActionCallCampaignName,
  UserActionCampaigns,
  UserActionDonationCampaignName,
  UserActionEmailCampaignName,
  UserActionLiveEventCampaignName,
  UserActionNftMintCampaignName,
  UserActionTweetAtPersonCampaignName,
  UserActionTweetCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
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
    [UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP]: {
      title: 'FIT21 Email Campaign',
      subtitle: 'You emailed your representative to thank them for their vote on FIT21.',
    },
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
      title: 'CNN Presidential Debate 2024',
      subtitle: "You emailed CNN and asked them to include the candidates' stance on crypto.",
    },
    [UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024]: {
      title: 'ABC Presidential Debate 2024',
      subtitle: "You emailed ABC and asked them to include the candidates' stance on crypto.",
    },
  },
  [UserActionType.TWEET_AT_PERSON]: {
    [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: {
      title: 'Pizza Day 2024',
      subtitle: 'You tweeted your representative for pizza day.',
    },
    [UserActionTweetAtPersonCampaignName['DEFAULT']]: {
      title: 'Tweet Campaign',
      subtitle: 'You tweeted.',
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
  [UserActionType.TWEET]: {
    [UserActionTweetCampaignName.DEFAULT]: {
      title: 'Tweet Campaign',
      subtitle: 'You helped bring more advocates to the cause by tweeting about SWC.',
    },
    [UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024]: {
      title: 'Follow SWC on X - 2024 Campaign',
      subtitle: 'You helped bring more advocates to the cause by following SWC on X.',
    },
  },
  [UserActionType.DONATION]: {
    [UserActionDonationCampaignName.DEFAULT]: {
      title: 'Donation',
      subtitle: 'You helped the cause by donating.',
    },
  },
  [UserActionType.NFT_MINT]: {
    [UserActionNftMintCampaignName.DEFAULT]: {
      title: 'Minted NFT',
      subtitle: 'You helped the cause by minting your supporter NFT.',
    },
  },
  [UserActionType.VOTER_REGISTRATION]: {
    [UserActionVoterRegistrationCampaignName.DEFAULT]: {
      title: 'Registered to vote',
      subtitle: 'You registered to vote.',
    },
  },
  [UserActionType.VOTER_ATTESTATION]: {
    [UserActionVoterAttestationCampaignName.DEFAULT]: {
      title: 'Pledged to vote',
      subtitle: 'You pledged to vote in the 2024 election.',
    },
  },
}
