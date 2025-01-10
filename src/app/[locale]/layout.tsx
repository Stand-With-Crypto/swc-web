import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { GoogleTagManager } from '@/components/app/googleTagManager'
import { Navbar } from '@/components/app/navbar'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails, TOP_LEVEL_METADATA_DETAILS } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { fontClassName } from '@/utils/web/fonts'
import { MaybeBuilderContent } from '@/components/app/maybeBuilderContent'

export { viewport } from '@/utils/server/metadataUtils'

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

export const metadata: Metadata = {
  ...generateMetadataDetails({ description, title, ogImage }),
  title: {
    default: title,
    template: '%s | Stand With Crypto',
  },
  ...TOP_LEVEL_METADATA_DETAILS,
}

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { locale } = await params

  if (!ORDERED_SUPPORTED_LOCALES.includes(locale)) {
    notFound()
  }

  return (
    <html lang={locale} translate="no">
      <GoogleTagManager />
      <body className={fontClassName}>
        <OverrideGlobalLocalStorage />
        <NextTopLoader
          color="hsl(var(--primary-cta))"
          shadow="0 0 10px hsl(var(--primary-cta)),0 0 5px hsl(var(--primary-cta))"
          showSpinner={false}
        />
        <TopLevelClientLogic locale={locale}>
          <FullHeight.Container>
            <NavBarGlobalBanner />
            <MaybeBuilderContent>
              <Navbar locale={locale} />
            </MaybeBuilderContent>
            <FullHeight.Content>{children}</FullHeight.Content>
            <MaybeBuilderContent>
              <Footer locale={locale} />
            </MaybeBuilderContent>
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent locale={locale} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
