import { NFTSlug } from '@/utils/shared/nft'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT = 'User Action Form Live Event'

export enum SectionNames {
  LANDING = 'Landing',
  SUCCESS = 'Success',
}

type Message = 'title' | 'signedOutSubtitle' | 'signedInSubtitle'

export const LIVE_EVENT_SLUG_NFT_METADATA: Record<UserActionLiveEventCampaignName, NFTSlug> = {
  [UserActionLiveEventCampaignName['2024_03_04_LA']]: NFTSlug.LA_CRYPTO_EVENT_2024_03_04,
  [UserActionLiveEventCampaignName['2024_05_22_PIZZA_DAY']]: NFTSlug.PIZZA_DAY_2024_05_22,
}

export const MESSAGES: Record<UserActionLiveEventCampaignName, Record<Message, string>> = {
  [UserActionLiveEventCampaignName['2024_03_04_LA']]: {
    title: 'Los Angeles Crypto Votes',
    signedOutSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Press continue in order to claim your free “Proof of Attendance” NFT.',
    signedInSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Claim your free “Proof of Attendance” NFT.',
  },
  [UserActionLiveEventCampaignName['2024_05_22_PIZZA_DAY']]: {
    title: 'Pizza Title',
    signedOutSubtitle: 'SignedOut Pizza Title',
    signedInSubtitle: 'SignedIn Pizza Title',
  },
}
