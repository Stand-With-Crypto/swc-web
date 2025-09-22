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
import * as euConfig from '@/app/eu/config'
import * as gbConfig from '@/app/gb/config'
import { CookieConsent } from '@/components/app/cookieConsent'
import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { GLOBAL_NAVBAR_BANNER_BY_COUNTRY_CODE } from '@/components/app/navbarGlobalBanner/common/constants'
import { FullHeight } from '@/components/ui/fullHeight'
import { extractCountryCodeFromPathname } from '@/utils/server/extractCountryCodeFromPathname'
import { NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE } from '@/utils/shared/speedInsights'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

const PAGE_LAYOUT_CONFIG_BY_COUNTRY_CODE = {
  [SupportedCountryCodes.US]: usConfig,
  [SupportedCountryCodes.AU]: auConfig,
  [SupportedCountryCodes.GB]: gbConfig,
  [SupportedCountryCodes.CA]: caConfig,
  [SupportedCountryCodes.EU]: euConfig,
} as const

export function NotFoundLayout({ children }: { children: React.ReactNode }) {
  // This is necessary because we're not under a country specific layout and we don't have other way to get the country code
  // that means that we need to resolve and render the layout client side based on the pathname
  // * It's not possible to force a `/[countryCode]/not-found` route without needing an intermediate page and having two routes render
  const pathname = usePathname()
  const countryCode = useMemo(() => {
    const extractedCountryCode = extractCountryCodeFromPathname(pathname!) ?? ''
    return Object.values(SupportedCountryCodes).includes(extractedCountryCode)
      ? (extractedCountryCode as SupportedCountryCodes)
      : DEFAULT_SUPPORTED_COUNTRY_CODE
  }, [pathname])

  const pageLayoutConfig = PAGE_LAYOUT_CONFIG_BY_COUNTRY_CODE[countryCode]

  let navbarConfig, footerConfig
  if (countryCode === SupportedCountryCodes.EU) {
    navbarConfig = (pageLayoutConfig as typeof euConfig).getNavbarConfig()
    footerConfig = (pageLayoutConfig as typeof euConfig).getFooterConfig()
  } else if (countryCode === SupportedCountryCodes.AU) {
    navbarConfig = (pageLayoutConfig as typeof auConfig).getNavbarConfig()
    footerConfig = (pageLayoutConfig as typeof auConfig).getFooterConfig()
  } else {
    navbarConfig = (pageLayoutConfig as typeof usConfig).getNavbarConfig()
    footerConfig = (pageLayoutConfig as typeof usConfig).getFooterConfig()
  }

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
            {GLOBAL_NAVBAR_BANNER_BY_COUNTRY_CODE[countryCode]}
            <Navbar {...navbarConfig} />
            <FullHeight.Content>{children}</FullHeight.Content>
            <Footer {...footerConfig} />
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
        <SpeedInsights debug={false} sampleRate={NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE} />
      </body>
    </html>
  )
}
