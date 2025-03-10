import { SpeedInsights } from '@vercel/speed-insights/next'
import NextTopLoader from 'nextjs-toploader'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { GoogleTagManager } from '@/components/app/googleTagManager'
import { Navbar, NavbarItem } from '@/components/app/navbar'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export function PageLayout({
  children,
  countryCode,
  navbarItems,
  shouldRenderGTM,
}: React.PropsWithChildren<{
  countryCode: SupportedCountryCodes
  navbarItems: NavbarItem[]
  shouldRenderGTM?: boolean
}>) {
  return (
    <html lang={COUNTRY_CODE_TO_LOCALE[countryCode]} translate="no">
      {shouldRenderGTM && <GoogleTagManager />}
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
            <Navbar countryCode={countryCode} navbarItems={navbarItems} />
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
