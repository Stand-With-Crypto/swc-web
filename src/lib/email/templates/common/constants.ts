import { INTERNAL_BASE_URL } from '@/lib/email/constants'

export type EmailActiveActions = 'CALL' | 'EMAIL' | 'DONATION' | 'NFT_MINT' | 'VOTER_REGISTRATION'

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
  EMAIL: {
    image: `/actionTypeIcons/email.png`,
    text: 'Email your Congressperson',
    subtext: "Follow-up your call with an email. We'll make it simple.",
    buttonLabel: 'Send an email',
    buttonHref: `/action/email`,
  },
  VOTER_REGISTRATION: {
    image: `/actionTypeIcons/registerToVote.png`,
    text: 'Register to vote',
    subtext: 'Check your voter registration status and get a free NFT by pplpleasr.',
    buttonLabel: 'Register',
    buttonHref: `/action/voter-registration`,
  },
  CALL: {
    image: `/actionTypeIcons/call.png`,
    text: `Call your Congressperson`,
    subtext: "The most effective way to make your voice heard. We'll show you how.",
    buttonLabel: 'Make a call',
    buttonHref: `/action/call`,
  },
  DONATION: {
    image: `/actionTypeIcons/donate.png`,
    text: 'Donate to Stand With Crypto',
    subtext: 'Support Stand with Crypto’s aim to mobilize 52 million crypto advocates in the US.',
    buttonLabel: 'Donate',
    buttonHref: `/donate`,
  },
  NFT_MINT: {
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
