import '@/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { Footer } from '@/components/app/footer'
import { FullHeight } from '@/components/ui/fullHeight'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { Navbar } from '@/components/app/navbar'
import { DEFAULT_LOCALE, ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { Toaster } from '@/components/ui/sonner'
import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Analytics } from '@vercel/analytics/react'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_LOCALES.map(locale => ({ locale }))
}

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })

const title = `Stand With Crypto`
const description = `Stand with Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
const ogImage = getOpenGraphImageUrl({ title: description })

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#272d3f',
}

export const metadata: Metadata = {
  ...generateMetadataDetails({ description, title, ogImage }),
  title: {
    default: title,
    template: '%s | Stand With Crypto',
  },
  metadataBase: new URL('https://www.standwithcrypto.org'),
  applicationName: 'Stand With Crypto',
  icons: [
    { url: '/logo/favicon-16x16.png', sizes: '16x16' },
    { url: '/logo/favicon-32x32.png', sizes: '32x32' },
  ],
  // manifest: '/site.webmanifest', // TODO figure out why we get 401s when we uncomment this
  appleWebApp: {
    title: 'Stand With Crypto',
    statusBarStyle: 'black-translucent',
    startupImage: ['/logo/apple-touch-icon.png'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className={inter.className}>
        <NextTopLoader />
        <TopLevelClientLogic locale={DEFAULT_LOCALE}>
          <FullHeight.Container>
            <FullHeight.Content>
              <Navbar locale={DEFAULT_LOCALE} />
              {children}
            </FullHeight.Content>
            <Footer locale={DEFAULT_LOCALE} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent locale={DEFAULT_LOCALE} />
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
      </body>
    </html>
  )
}
