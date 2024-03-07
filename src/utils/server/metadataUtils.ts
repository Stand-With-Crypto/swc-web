import { Metadata } from 'next'

import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'

export const sharedOpenGraphMetadata = {
  siteName: 'Stand With Crypto',
  locale: 'en_US',
  type: 'website',
} satisfies Partial<Metadata['openGraph']>

const videoUrl =
  'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/shield/stand-with-crypto-h8EMnIjlCFnMREravQ2irnktkh6egS.mp4'

export const sharedTwitterMetadata = {
  card: 'player',
  //   siteId: '', TODO figure out what standwithcrypto is via the twitter api
  creator: '@standwithcrypto',
  //   creatorId: '', TODO figure out what standwithcrypto is via the twitter api
  title: 'Stand With Crypto',
  description: 'Test description',
  // image: '',
  players: {
    playerUrl: videoUrl,
    streamUrl: videoUrl,
    height: 480,
    width: 480,
  },
} satisfies Partial<Metadata['twitter']>

export const generateMetadataDetails = ({
  title,
  description,
  ogImage,
}: {
  title: string
  description?: string
  ogImage?: {
    url: string | URL
    secureUrl?: string | URL
    alt?: string
    type?: string
    width?: string | number
    height?: string | number
  }
}) => {
  const useImage = ogImage || getOpenGraphImageUrl({ title, description })
  return {
    title,
    description,
    openGraph: {
      ...sharedOpenGraphMetadata,
      title,
      description,
      images: [useImage],
    },
    twitter: {
      ...sharedTwitterMetadata,
      title,
      description,
      images: [useImage],
    },
  } satisfies Metadata
}
