import { Metadata, Viewport } from 'next'

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

interface MetadataDetails {
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
}

export const generateMetadataDetails = ({
  title,
  description,
  ogImage,
}: MetadataDetails): Metadata => {
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
    metadataBase: new URL('https://www.standwithcrypto.org'),
    applicationName: 'Stand With Crypto',
    icons: [
      { url: '/logo/favicon-16x16.png', sizes: '16x16' },
      { url: '/logo/favicon-32x32.png', sizes: '32x32' },
    ],
    // manifest: '/site.webmanifest', // LATER-TASK figure out why we get 401s when we uncomment this
    appleWebApp: {
      title: 'Stand With Crypto',
      statusBarStyle: 'black-translucent',
      startupImage: ['/logo/apple-touch-icon.png'],
    },
  } satisfies Metadata
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fff',
}
