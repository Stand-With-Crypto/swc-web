import { NFTSlug } from '@/utils/shared/nft'

export enum USEmailActiveActions {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  DONATION = 'DONATION',
  NFT_MINT = 'NFT_MINT',
}

export enum USEmailEnabledActionNFTs {
  CALL = 'CALL',
  CLAIM_NFT = 'CLAIM_NFT',
}

export type USEmailEnabledActionNFTsNames = `${USEmailEnabledActionNFTs}`

export const US_NFT_SLUG_TO_EMAIL_ACTIVE_ACTION: Partial<
  Record<NFTSlug, USEmailEnabledActionNFTs>
> = {
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: USEmailEnabledActionNFTs.CALL,
  [NFTSlug.GENIUS_ACT_2025]: USEmailEnabledActionNFTs.CLAIM_NFT,
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const US_ACTIONS_METADATA_BY_TYPE: Record<
  USEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [USEmailActiveActions.EMAIL]: {
    image: `/actionTypeIcons/email.png`,
    text: 'Email your Congressperson',
    subtext: 'Make your voice heard. We make it easy.',
    buttonLabel: 'Send an email',
    buttonHref: `/action/email`,
  },
  [USEmailActiveActions.CALL]: {
    image: `/actionTypeIcons/call.png`,
    text: `Call your Congressperson`,
    subtext: "The most effective way to make your voice heard. We'll show you how.",
    buttonLabel: 'Make a call',
    buttonHref: `/action/call`,
  },
  [USEmailActiveActions.DONATION]: {
    image: `/actionTypeIcons/donate.png`,
    text: 'Donate to Stand With Crypto',
    subtext: "Support Stand With Crypto's aim to mobilize 52 million crypto advocates in the US.",
    buttonLabel: 'Donate',
    buttonHref: `/donate`,
  },
  [USEmailActiveActions.NFT_MINT]: {
    image: `/actionTypeIcons/mintNFT.png`,
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    buttonLabel: 'Mint',
    buttonHref: `/action/nft-mint`,
  },
}

export const US_SOCIAL_MEDIA_URL = {
  facebook: 'https://www.facebook.com/standwithcrypto',
  instagram: 'https://www.instagram.com/standwithcrypto',
  twitter: 'https://twitter.com/standwithcrypto',
}

export interface USEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}

export const US_NFT_IMAGES_BY_ACTION: Record<
  USEmailEnabledActionNFTsNames,
  { src: string; alt: string }
> = {
  CALL: {
    src: '/email/nfts/call.png',
    alt: 'Call Action NFT',
  },
  CLAIM_NFT: {
    src: '/email/nfts/claim-nft.png',
    alt: 'Claim NFT',
  },
}
