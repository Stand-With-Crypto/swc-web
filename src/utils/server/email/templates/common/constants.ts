import { NFTSlug } from '@/utils/shared/nft'

export enum EmailActiveActions {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  DONATION = 'DONATION',
  NFT_MINT = 'NFT_MINT',
}

export enum EmailEnabledActionNFTs {
  CALL = 'CALL',
}

export type EmailEnabledActionNFTsNames = `${EmailEnabledActionNFTs}`

export const NFT_SLUG_TO_EMAIL_ACTIVE_ACTION: Partial<Record<NFTSlug, EmailEnabledActionNFTs>> = {
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: EmailEnabledActionNFTs.CALL,
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const ACTIONS_METADATA_BY_TYPE: Record<
  EmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [EmailActiveActions.EMAIL]: {
    image: `/actionTypeIcons/email.png`,
    text: 'Email your Congressperson',
    subtext: 'Make your voice heard. We make it easy.',
    buttonLabel: 'Send an email',
    buttonHref: `/action/email`,
  },
  [EmailActiveActions.CALL]: {
    image: `/actionTypeIcons/call.png`,
    text: `Call your Congressperson`,
    subtext: "The most effective way to make your voice heard. We'll show you how.",
    buttonLabel: 'Make a call',
    buttonHref: `/action/call`,
  },
  [EmailActiveActions.DONATION]: {
    image: `/actionTypeIcons/donate.png`,
    text: 'Donate to Stand With Crypto',
    subtext: "Support Stand With Crypto's aim to mobilize 52 million crypto advocates in the US.",
    buttonLabel: 'Donate',
    buttonHref: `/donate`,
  },
  [EmailActiveActions.NFT_MINT]: {
    image: `/actionTypeIcons/mintNFT.png`,
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    buttonLabel: 'Mint',
    buttonHref: `/action/nft-mint`,
  },
}

export const SOCIAL_MEDIA_URL = {
  facebook: 'https://www.facebook.com/standwithcrypto',
  instagram: 'https://www.instagram.com/standwithcrypto',
  twitter: 'https://twitter.com/standwithcrypto',
}

export interface EmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}

export const NFT_IMAGES_BY_ACTION: Record<
  EmailEnabledActionNFTsNames,
  { src: string; alt: string }
> = {
  CALL: {
    src: '/email/nfts/call.png',
    alt: 'Call Action NFT',
  },
}
