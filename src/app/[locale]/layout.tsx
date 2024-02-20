import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import _ from 'lodash'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'

import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { MaybeRenderGoogleTagManager } from '@/components/app/maybeRenderGoogleTagManager'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_LOCALES.map(locale => ({ locale }))
}

const inter = Inter({ subsets: ['latin'] })

const title = `${
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? ''
    : `${_.capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
}Stand With Crypto`
const description = `Stand with Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
const ogImage = getOpenGraphImageUrl({ title: description })

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fff',
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
  // manifest: '/site.webmanifest', // LATER-TASK figure out why we get 401s when we uncomment this
  appleWebApp: {
    title: 'Stand With Crypto',
    statusBarStyle: 'black-translucent',
    startupImage: ['/logo/apple-touch-icon.png'],
  },
}

export default function Layout({ children, params }: PageProps & { children: React.ReactNode }) {
  const { locale } = params

  if (!ORDERED_SUPPORTED_LOCALES.includes(locale)) {
    notFound()
  }
  return (
    <html lang={locale}>
      <body className={inter.className}>
        {/* LATER-TASK add back once https://github.com/TheSGJ/nextjs-toploader/issues/66 is resolved */}
        {/* <NextTopLoader /> */}
        <TopLevelClientLogic locale={locale}>
          <FullHeight.Container>
            <FullHeight.Content>
              <Navbar locale={locale} />
              <div className="lg:mt-10">{children}</div>
            </FullHeight.Content>
            <Footer locale={locale} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent locale={locale} />
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
        <MaybeRenderGoogleTagManager />
      </body>
    </html>
  )
}
