import { NFTSlug } from '@/utils/shared/nft'

export interface NFTClientMetadata {
  name: string
  image: { url: string; width: number; height: number; alt: string }
}
export const NFT_CLIENT_METADATA: Record<NFTSlug, NFTClientMetadata> = {
  [NFTSlug.SWC_SHIELD]: {
    image: {
      alt: 'SWC Shield',
      height: 512,
      url: '/images/nft/swc-shield.png',
      width: 512,
    },
    name: 'SWC Shield',
  },
  [NFTSlug.CALL_REPRESENTATIVE_SEPT_11]: {
    image: {
      alt: 'A rotating phone with the text "I called congress" below it',
      height: 160,
      url: '/nfts/call.gif',
      width: 160,
    },
    name: 'Call Representative Sept 11',
  },
}
