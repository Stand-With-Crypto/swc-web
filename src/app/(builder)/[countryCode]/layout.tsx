import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

import { TopLevelBuilderClientLogic } from '@/app/(builder)/[countryCode]/topLevelBuilderClientLogic'
import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { CookieConsent } from '@/components/app/cookieConsent'
import { GoogleTagManager } from '@/components/app/googleTagManager'
import { NavBarGlobalBanner } from '@/components/app/navbarGlobalBanner'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails, TOP_LEVEL_METADATA_DETAILS } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  COUNTRY_CODE_TO_LOCALE,
  ORDERED_SUPPORTED_COUNTRIES,
} from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export { viewport } from '@/utils/server/metadataUtils'

// we want dynamicParams to be false for this top level layout, but we also want to ensure that subpages can have dynamic params
// Next.js doesn't allow this so we allow dynamic params in the config here, and then trigger a notFound in the layout if one is passed
// export const dynamicParams = false
export async function generateStaticParams() {
  return ORDERED_SUPPORTED_COUNTRIES.map(countryCode => ({ countryCode }))
}

const title = `${
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? ''
    : `${capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
}Stand With Crypto`
const description = `Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.`
const ogImage = getOpenGraphImageUrl({ title: description })

export const metadata: Metadata = {
  ...generateMetadataDetails({ description, title, ogImage }),
  title: {
    default: title,
    template: '%s | Stand With Crypto',
  },
  ...TOP_LEVEL_METADATA_DETAILS,
}

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  if (!ORDERED_SUPPORTED_COUNTRIES.includes(countryCode)) {
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
          <TopLevelBuilderClientLogic>
            <FullHeight.Container>
              <NavBarGlobalBanner />
              <FullHeight.Content>{children}</FullHeight.Content>
            </FullHeight.Container>
          </TopLevelBuilderClientLogic>
        </TopLevelClientLogic>
        <Toaster />
        <CookieConsent countryCode={countryCode} />
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
