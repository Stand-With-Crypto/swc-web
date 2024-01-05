import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'

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
  manifest: '/site.webmanifest',
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
        <NextTopLoader />
        <TopLevelClientLogic>
          <FullHeight.Container>
            <FullHeight.Content>
              <Navbar {...{ locale }} />
              <main>{children}</main>
            </FullHeight.Content>
            <Footer {...{ locale }} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
      </body>
    </html>
  )
}
