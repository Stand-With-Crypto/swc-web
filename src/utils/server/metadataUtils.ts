import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { Metadata } from 'next'

export const sharedOpenGraphMetadata = {
  locale: 'en_US',
  siteName: 'Stand With Crypto',
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
    description,
    openGraph: {
      ...sharedOpenGraphMetadata,
      description,
      images: [useImage],
      title,
    },
    title,
    twitter: {
      ...sharedTwitterMetadata,
      description,
      images: [useImage],
      title,
    },
  } satisfies Metadata
}
