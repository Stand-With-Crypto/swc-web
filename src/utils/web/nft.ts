import type { NFTMetadata } from 'thirdweb/utils'

import { NFTSlug } from '@/utils/shared/nft'

export interface NFTClientMetadata extends Pick<NFTMetadata, 'description'> {
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
    description: `This collectible commemorates the launch of the Stand With Crypto Alliance on August 14, 2023.\n\nPriced at 0.00435 ETH, this represents the 435 congressional districts in the U.S. All proceeds benefit the Alliance.\n\nSecure yours on standwithcrypto.org.`,
    image: {
      url: '/nfts/swc-supporter.gif',
      width: 160,
      height: 160,
      alt: 'a square gif of the SWC shield that changes color over time',
    },
  },
  [NFTSlug.LA_CRYPTO_EVENT_2024_03_04]: {
    name: '2024-03-04 LA Crypto Event',
    image: {
      url: '/nfts/2024-03-04-la-crypto-event.jpg',
      width: 160,
      height: 160,
      alt: 'a square image of the SWC shield with the california state shape inside of it',
    },
  },
  [NFTSlug.PIZZA_DAY_2024_05_22]: {
    name: '2024-05-22 Pizza Day',
    image: {
      url: '/nfts/2024-05-22-pizza-day.gif',
      width: 654,
      height: 366,
      alt: 'Pizza and bitcoin tags that transform into the SWC shield',
    },
  },
  [NFTSlug.VOTER_ATTESTATION]: {
    name: 'Ballot Box Badge',
    image: {
      url: '/nfts/ballot-box-badge.gif',
      width: 160,
      height: 160,
      alt: 'Ballot box badge nft',
    },
  },
  [NFTSlug.I_VOTED]: {
    name: 'I voted',
    image: {
      url: '/nfts/NFT_IVoted.gif',
      width: 160,
      height: 160,
      alt: 'I voted nft',
    },
  },
  [NFTSlug.GENIUS_ACT_2025]: {
    name: 'The GENIUS Act: Passed in the USA',
    description: `This collectible commemorates the GENIUS Act, the first crypto law in U.S. history, which regulates stablecoins and marks a step toward modernizing the financial system. It honors the Stand With Crypto advocates whose votes, calls, and emails made clear that the Crypto Voter matters`,
    image: {
      url: '/nfts/Genius_NFT_2.png',
      width: 160,
      height: 160,
      alt: 'A vintage postage stamp design featuring the U.S. Capitol, labeled "GENIUS ACT July 2025" with a "Passed in the USA" badge in the corner',
    },
  },
}
