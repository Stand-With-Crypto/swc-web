import { NFTSlug } from '@/utils/shared/nft'

export interface NFTClientMetadata {
  name: string
  image: { url: string; width: number; height: number; alt: string }
}
export const NFT_CLIENT_METADATA: Record<NFTSlug, NFTClientMetadata> = {
  [NFTSlug.SWC_SHIELD]: {
    name: 'SWC Shield',
    image: {
      url: '/nfts/membership-swc-shield.gif',
      width: 512,
      height: 512,
      alt: 'a rotating SWC shield with the text "STAND WITH CRYPTO" on the top-left and the text "MEMBER" on the bottom right',
    },
  },
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: {
    name: 'Call Representative Sept 11',
    image: {
      url: '/nfts/call.gif',
      width: 160,
      height: 160,
      alt: 'a rotating phone with the text "I CALLED CONGRESS" below it',
    },
  },
  [NFTSlug.I_AM_A_VOTER]: {
    name: "I'm a voter",
    image: {
      url: '/nfts/i-am-a-voter.jpg',
      width: 160,
      height: 160,
      alt: 'circular image with a robotic woman with the text "I\'M A VOTER" overlaid top of it',
    },
  },
  [NFTSlug.STAND_WITH_CRYPTO_LEGACY]: {
    name: 'Stand With Crypto Legacy',
    image: {
      url: '/nfts/swc-legacy.jpg',
      width: 160,
      height: 160,
      alt: 'a square image of a QR code with a blue shield in the middle',
    },
  },
  [NFTSlug.STAND_WITH_CRYPTO_SUPPORTER]: {
    name: 'Stand With Crypto Supporter',
    image: {
      url: '/nfts/swc-supporter.gif',
      width: 160,
      height: 160,
      alt: 'a square gif of the SWC shield that changes color over time',
    },
  },
}
