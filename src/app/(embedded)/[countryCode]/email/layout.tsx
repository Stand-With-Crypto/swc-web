import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import { Metadata, Viewport } from 'next'

import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { PageProps } from '@/types'
import { viewport as defaultViewport } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  COUNTRY_CODE_TO_LOCALE,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  ORDERED_SUPPORTED_COUNTRIES,
} from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

const title = `${
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? ''
    : `${capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Env - `
}Stand With Crypto`

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s | Stand With Crypto',
  },
}

export const viewport: Viewport = defaultViewport

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  let { countryCode } = await params

  if (!ORDERED_SUPPORTED_COUNTRIES.includes(countryCode)) {
    countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE
  }

  return (
    <html lang={COUNTRY_CODE_TO_LOCALE[countryCode]} translate="no">
      <body className={fontClassName}>
        <OverrideGlobalLocalStorage />
        <FullHeight.Container>
          <FullHeight.Content>{children}</FullHeight.Content>
        </FullHeight.Container>
        <Toaster />
        <SpeedInsights debug={false} sampleRate={0.01} />
      </body>
    </html>
  )
}
