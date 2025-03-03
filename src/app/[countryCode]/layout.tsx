import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { GoogleTagManager } from '@/components/app/googleTagManager'
import { Navbar } from '@/components/app/navbar'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { PageProps } from '@/types'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import {
  COUNTRY_CODE_TO_LOCALE,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
} from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export { viewport } from '@/utils/server/metadataUtils'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return [{ countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE }]
}

export const metadata: Metadata = generateCountryCodeLayoutMetadata(DEFAULT_SUPPORTED_COUNTRY_CODE)

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  if (countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return (
    <html lang={COUNTRY_CODE_TO_LOCALE[countryCode]} translate="no">
      <GoogleTagManager />
      <body className={fontClassName}>
        <OverrideGlobalLocalStorage />
        <NextTopLoader
          color="hsl(var(--primary-cta))"
          shadow="0 0 10px hsl(var(--primary-cta)),0 0 5px hsl(var(--primary-cta))"
          showSpinner={false}
        />
        <TopLevelClientLogic countryCode={countryCode}>
          <FullHeight.Container>
            <NavBarGlobalBanner />
            <Navbar countryCode={countryCode} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer countryCode={countryCode} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={countryCode} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
