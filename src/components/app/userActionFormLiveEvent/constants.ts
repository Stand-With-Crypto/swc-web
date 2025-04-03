import { NFTSlug } from '@/utils/shared/nft'
import { USUserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT = 'User Action Form Live Event'

export enum SectionNames {
  LANDING = 'Landing',
  SUCCESS = 'Success',
}

type Message = 'title' | 'signedOutSubtitle' | 'signedInSubtitle'

export const LIVE_EVENT_SLUG_NFT_METADATA: Record<USUserActionLiveEventCampaignName, NFTSlug> = {
  [USUserActionLiveEventCampaignName['2024_03_04_LA']]: NFTSlug.LA_CRYPTO_EVENT_2024_03_04,
}

export const MESSAGES: Record<USUserActionLiveEventCampaignName, Record<Message, string>> = {
  [USUserActionLiveEventCampaignName['2024_03_04_LA']]: {
    title: 'Los Angeles Crypto Votes',
    signedOutSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Press continue in order to claim your free “Proof of Attendance” NFT.',
    signedInSubtitle:
      'Thanks for attending our Los Angeles Crypto Votes event! Claim your free “Proof of Attendance” NFT.',
  },
}
