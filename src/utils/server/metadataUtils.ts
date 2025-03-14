import { capitalize } from 'lodash-es'
import { Metadata, Viewport } from 'next'

import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const sharedOpenGraphMetadata = {
  siteName: 'Stand With Crypto',
  locale: 'en_US',
  type: 'website',
} satisfies Partial<Metadata['openGraph']>

const sharedTwitterMetadata = {
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

export const TOP_LEVEL_METADATA_DETAILS: Partial<Metadata> = {
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
  } satisfies Metadata
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fff',
}

export function generateCountryCodeLayoutMetadata(countryCode: SupportedCountryCodes) {
  const countryCodePrefix =
    countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE ? '' : `${countryCode.toUpperCase()} `

  const title = `${
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? ''
      : `${capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
  }${countryCodePrefix}Stand With Crypto`
  const description = `Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
  const ogImage = getOpenGraphImageUrl({ title: description })

  return {
    ...generateMetadataDetails({ description, title, ogImage }),
    title: {
      default: title,
      template: `%s | ${countryCodePrefix}Stand With Crypto`,
    },
    ...TOP_LEVEL_METADATA_DETAILS,
  } satisfies Metadata
}
