import { SpeedInsights } from '@vercel/speed-insights/next'
import NextTopLoader from 'nextjs-toploader'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export function PageLayout({
  children,
  countryCode,
}: React.PropsWithChildren<{ countryCode: SupportedCountryCodes }>) {
  return (
    <html lang={COUNTRY_CODE_TO_LOCALE[countryCode]} translate="no">
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
            {children}
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={countryCode} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
