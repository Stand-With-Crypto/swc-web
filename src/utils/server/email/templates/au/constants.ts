import { NFTSlug } from '@/utils/shared/nft'

export enum AUEmailActiveActions {
  TWEET = 'TWEET',
  REFER = 'REFER',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const AU_ACTIONS_METADATA_BY_TYPE: Record<
  AUEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [AUEmailActiveActions.TWEET]: {
    image: `/au/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/au/action/share`,
  },
  [AUEmailActiveActions.REFER]: {
    image: `/au/actionTypeIcons/refer.png`,
    text: 'Refer a friend',
    subtext: 'Refer a friend to Stand With Crypto.',
    buttonLabel: 'Refer a friend',
    buttonHref: `/au/action/refer`,
  },
  [AUEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/au/actionTypeIcons/view-key-races.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/au/races`,
  },
}

export const AU_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_AU',
  linkedin: 'https://www.linkedin.com/company/stand-with-crypto-australia',
}

export interface AUEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}

export enum AUEmailEnabledActionNFTs {}

export type AUEmailEnabledActionNFTsNames = `${AUEmailEnabledActionNFTs}`

export const AU_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION: Partial<
  Record<NFTSlug, AUEmailEnabledActionNFTs>
> = {}

export const AU_NFT_IMAGES_BY_ACTION: Record<
  AUEmailEnabledActionNFTsNames,
  { src: string; alt: string }
> = {}
