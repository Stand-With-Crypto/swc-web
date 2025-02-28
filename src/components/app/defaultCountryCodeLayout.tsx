import '@/globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export const dynamic = 'error'

export function DefaultCountryCodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <body className={fontClassName}>
        {/* LATER-TASK add back once https://github.com/TheSGJ/nextjs-toploader/issues/66 is resolved */}
        {/* <NextTopLoader /> */}
        <TopLevelClientLogic countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}>
          <FullHeight.Container>
            <Navbar countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
        {/* <Analytics debug={false} /> */}
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
