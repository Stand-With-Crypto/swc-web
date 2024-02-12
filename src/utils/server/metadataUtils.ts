import { Metadata } from 'next'

import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'

export const sharedOpenGraphMetadata = {
  siteName: 'Stand With Crypto',
  locale: 'en_US',
  type: 'website',
} satisfies Partial<Metadata['openGraph']>

export const sharedTwitterMetadata = {
  card: 'summary_large_image',
  //   siteId: '', TODO figure out what standwithcrypto is via the twitter api
  creator: '@standwithcrypto',
  //   creatorId: '', TODO figure out what standwithcrypto is via the twitter api
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
  const useImage = ogImage || getOpenGraphImageUrl({ title })
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
