import '@/globals.css'

import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'
import { FullHeight } from '@/components/ui/fullHeight'
import { DEFAULT_LOCALE } from '@/intl/locales'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })
export const dynamic = 'error'

export default function NotFound() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader />
        <TopLevelClientLogic locale={DEFAULT_LOCALE}>
          <FullHeight.Container>
            <FullHeight.Content>
              <Navbar locale={DEFAULT_LOCALE} />
              <NotFoundPagesContent />
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
