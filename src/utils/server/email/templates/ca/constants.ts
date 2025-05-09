import { NFTSlug } from '@/utils/shared/nft'

export enum CAEmailActiveActions {
  TWEET = 'TWEET',
  REFER = 'REFER',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const CA_ACTIONS_METADATA_BY_TYPE: Record<
  CAEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [CAEmailActiveActions.TWEET]: {
    image: `/ca/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/ca/action/share`,
  },
  [CAEmailActiveActions.REFER]: {
    image: `/ca/actionTypeIcons/refer.png`,
    text: 'Refer a friend',
    subtext: 'Refer a friend to Stand With Crypto.',
    buttonLabel: 'Refer a friend',
    buttonHref: `/ca/action/refer`,
  },
  [CAEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/ca/actionTypeIcons/view-key-races.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/ca/races`,
  },
}

export const CA_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_CA',
  linkedin: 'https://www.linkedin.com/company/stand-with-crypto-canada',
}

export interface CAEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}

export enum CAEmailEnabledActionNFTs {}

export type CAEmailEnabledActionNFTsNames = `${CAEmailEnabledActionNFTs}`

export const CA_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION: Partial<
  Record<NFTSlug, CAEmailEnabledActionNFTs>
> = {}

export const CA_NFT_IMAGES_BY_ACTION: Record<
  CAEmailEnabledActionNFTsNames,
  { src: string; alt: string }
> = {}
