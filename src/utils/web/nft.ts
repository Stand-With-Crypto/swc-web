import { NFTSlug } from '@/utils/shared/nft'

export interface NFTClientMetadata {
  name: string
  image: { url: string; width: number; height: number; alt: string }
}
export const NFT_CLIENT_METADATA: Record<NFTSlug, NFTClientMetadata> = {
  [NFTSlug.SWC_SHIELD]: {
    name: 'SWC Shield',
    image: {
      url: '/images/nft/swc-shield.png',
      width: 512,
      height: 512,
      alt: 'SWC Shield',
    },
  },
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: {
    name: 'Call Representative Sept 11',
    image: {
      url: '/nfts/call.gif',
      width: 160,
      height: 160,
      alt: 'A rotating phone with the text "I called congress" below it',
    },
  },
  [NFTSlug.I_AM_A_VOTER]: {
    name: 'I am a voter',
    image: {
      url: '/nfts/i-am-a-voter-nft.png',
      width: 160,
      height: 160,
      alt: 'a woman pointing at a computer with the text "i\'m a voter" in the center of the image',
    },
  },
}
