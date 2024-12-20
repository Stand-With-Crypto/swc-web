import '@/globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'

import { TopLevelClientLogic } from '@/app/en-US/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { DEFAULT_LOCALE } from '@/intl/locales'
import { fontClassName } from '@/utils/web/fonts'

export const dynamic = 'error'

export function DefaultLocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <body className={fontClassName}>
        {/* LATER-TASK add back once https://github.com/TheSGJ/nextjs-toploader/issues/66 is resolved */}
        {/* <NextTopLoader /> */}
        <TopLevelClientLogic locale={DEFAULT_LOCALE}>
          <FullHeight.Container>
            <Navbar locale={DEFAULT_LOCALE} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer locale={DEFAULT_LOCALE} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent locale={DEFAULT_LOCALE} />
        {/* <Analytics debug={false} /> */}
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
