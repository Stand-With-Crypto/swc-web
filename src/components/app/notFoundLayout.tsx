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
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

import { getCountryConfig } from '@/configs'

export async function NotFoundLayout({ children }: { children: React.ReactNode }) {
  //TODO: @olavoparno - this is a temporary layout for the not found page. We should get countryCode according to the user's location

  const defaultConfig = await getCountryConfig(DEFAULT_SUPPORTED_COUNTRY_CODE)

  return (
    <html lang="en" translate="no">
      <body className={fontClassName}>
        <NextTopLoader
          color="hsl(var(--primary-cta))"
          shadow="0 0 10px hsl(var(--primary-cta)),0 0 5px hsl(var(--primary-cta))"
          showSpinner={false}
        />
        <TopLevelClientLogic countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}>
          <FullHeight.Container>
            <Navbar {...defaultConfig.navbar} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer {...defaultConfig.footer} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
