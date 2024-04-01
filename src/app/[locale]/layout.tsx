import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'

import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { fontClassName } from '@/utils/web/fonts'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_LOCALES.map(locale => ({ locale }))
}

const title = `${
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? ''
    : `${capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
}Stand With Crypto`
const description = `Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
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
      <body className={fontClassName}>
        {/* LATER-TASK add back once https://github.com/TheSGJ/nextjs-toploader/issues/66 is resolved */}
        {/* <NextTopLoader /> */}
        <Script id="localStorageOverride" strategy="beforeInteractive">
          {`
            console.log('Overriding localStorage methods')
            try {
              const clear = localStorage.clear
              const getItem = localStorage.getItem
              const key = localStorage.key
              const removeItem = localStorage.removeItem
              const setItem = localStorage.setItem

              localStorage.clear = function () {
                try {
                  clear.call(this)
                } catch (e) {
                  console.error('Failed to clear localStorage:', e)
                }
              }

              localStorage.getItem = function (keyString) {
                try {
                  console.log('Getting item from localStorage:', keyString)
                  return getItem.call(this, keyString)
                } catch (e) {
                  console.error('Failed to retrieve item from localStorage:', e)
                  return null
                }
              }

              localStorage.key = function (index) {
                try {
                  console.log('Getting key from localStorage:', index)
                  return key.call(this, index)
                } catch (e) {
                  console.error('Failed to retrieve key from localStorage:', e)
                  return null
                }
              }

              localStorage.removeItem = function (keyString) {
                try {
                  console.log('Removing item from localStorage:', keyString)
                  removeItem.call(this, keyString)
                } catch (e) {
                  console.error('Failed to remove item from localStorage:', e)
                }
              }

              localStorage.setItem = function (keyString, value) {
                try {
                  console.log('Storing item in localStorage:', keyString, value)
                  setItem.call(this, keyString, value)
                } catch (e) {
                  console.error('Failed to store item in localStorage:', e)
                }
              }
            } catch (e) {
              console.error('Failed to override localStorage methods:', e)
              window.localStorage = {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {},
                key: () => null,
                length: 0,
              }
              console.log('Initialized no-op localStorage')
            }
          `}
        </Script>
        <TopLevelClientLogic locale={locale}>
          <FullHeight.Container>
            <Navbar locale={locale} />
            <FullHeight.Content>
              <div className="lg:mt-10">{children}</div>
            </FullHeight.Content>
            <Footer locale={locale} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent locale={locale} />
        {/* <Analytics debug={false} /> */}
        <SpeedInsights debug={false} sampleRate={0.01} />
      </body>
    </html>
  )
}
