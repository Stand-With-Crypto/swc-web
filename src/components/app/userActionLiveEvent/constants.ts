import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export const MESSAGES: Record<UserActionLiveEventCampaignName, Record<string, string>> = {
  [UserActionLiveEventCampaignName.DEFAULT]: {
    title: 'Los Angeles Crypto Votes',
    signedOutSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Sign in to Stand With Crypto in order to claim your free “Proof of Attendance” NFT.',
    signedInSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Claim your free “Proof of Attendance” NFT.',
  },
}
