'use client'

import '@/globals.css'

import { useMemo } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { usePathname } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'

import * as usConfig from '@/app/[countryCode]/config'
import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import * as auConfig from '@/app/au/config'
import * as caConfig from '@/app/ca/config'
import * as gbConfig from '@/app/gb/config'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { FullHeight } from '@/components/ui/fullHeight'
import { extractCountryCode } from '@/utils/server/obfuscateURLCountryCode'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

const PAGE_LAYOUT_CONFIG_BY_COUNTRY_CODE: Record<SupportedCountryCodes, typeof usConfig> = {
  [SupportedCountryCodes.US]: usConfig,
  [SupportedCountryCodes.AU]: auConfig,
  [SupportedCountryCodes.GB]: gbConfig,
  [SupportedCountryCodes.CA]: caConfig,
}

export function NotFoundLayout({ children }: { children: React.ReactNode }) {
  // This is necessary because we're not under a country specific layout and we don't have other way to get the country code
  // that means that we need to resolve and render the layout client side based on the pathname
  // * It's not possible to force a `/[countryCode]/not-found` route without needing an intermediate page and having two routes render
  const pathname = usePathname()
  const countryCode = useMemo(() => {
    const extractedCountryCode = extractCountryCode(pathname!) ?? ''
    return Object.values(SupportedCountryCodes).includes(extractedCountryCode)
      ? (extractedCountryCode as SupportedCountryCodes)
      : DEFAULT_SUPPORTED_COUNTRY_CODE
  }, [pathname])

  const pageLayoutConfig = PAGE_LAYOUT_CONFIG_BY_COUNTRY_CODE[countryCode]

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
            <NavBarGlobalBanner countryCode={countryCode} />
            <Navbar {...pageLayoutConfig.navbarConfig} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer {...pageLayoutConfig.footerConfig} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
