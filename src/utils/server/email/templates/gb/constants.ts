import { NFTSlug } from '@/utils/shared/nft'

export enum GBEmailActiveActions {
  TWEET = 'TWEET',
  REFER = 'REFER',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const GB_ACTIONS_METADATA_BY_TYPE: Record<
  GBEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [GBEmailActiveActions.TWEET]: {
    image: `/gb/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/gb/action/share`,
  },
  [GBEmailActiveActions.REFER]: {
    image: `/gb/actionTypeIcons/refer.png`,
    text: 'Refer a friend',
    subtext: 'Refer a friend to Stand With Crypto.',
    buttonLabel: 'Refer a friend',
    buttonHref: `/gb/action/refer`,
  },
}

export const GB_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_UK',
  linkedin: 'https://www.linkedin.com/company/standwithcryptouk',
}

export interface GBEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}

export enum GBEmailEnabledActionNFTs {}

export type GBEmailEnabledActionNFTsNames = `${GBEmailEnabledActionNFTs}`

export const GB_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION: Partial<
  Record<NFTSlug, GBEmailEnabledActionNFTs>
> = {}

export const GB_NFT_IMAGES_BY_ACTION: Record<
  GBEmailEnabledActionNFTsNames,
  { src: string; alt: string }
> = {}
