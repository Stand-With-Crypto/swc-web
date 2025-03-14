'use client'

import '@/globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { useLocalUser } from '@/hooks/useLocalUser'
import { getCountryCodeFromLocalUser } from '@/utils/shared/localUser'
import { fontClassName } from '@/utils/web/fonts'

export function NotFoundLayout({ children }: { children: React.ReactNode }) {
  const localUser = useLocalUser()
  const countryCode = getCountryCodeFromLocalUser(localUser)

  return (
    <html lang="en" translate="no">
      <body className={fontClassName}>
        <NextTopLoader
          color="hsl(var(--primary-cta))"
          shadow="0 0 10px hsl(var(--primary-cta)),0 0 5px hsl(var(--primary-cta))"
          showSpinner={false}
        />
        <TopLevelClientLogic countryCode={countryCode}>
          <FullHeight.Container>
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
