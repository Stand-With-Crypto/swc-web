import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import { Metadata, Viewport } from 'next'

import { TopLevelEmbeddedClientLogic } from '@/app/embedded/[countryCode]/topLevelEmbeddedClientLogic'
import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import {
  generateMetadataDetails,
  generateTopLevelMetadataDetails,
  viewport as defaultViewport,
} from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'
import { fontClassName } from '@/utils/web/fonts'

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
  ...generateTopLevelMetadataDetails(DEFAULT_SUPPORTED_COUNTRY_CODE),
}

export const viewport: Viewport = {
  ...defaultViewport,
  themeColor: { media: '(prefers-color-scheme: dark)', color: '#000000' },
}

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { countryCode } = await params

  return (
    <html lang={SupportedLocale.EN_US} translate="no">
      <body className={cn(fontClassName, 'bg-black')}>
        <OverrideGlobalLocalStorage />
        <TopLevelEmbeddedClientLogic countryCode={countryCode}>
          <FullHeight.Container>
            <FullHeight.Content>{children}</FullHeight.Content>
          </FullHeight.Container>
        </TopLevelEmbeddedClientLogic>
        <SpeedInsights debug={false} sampleRate={0.04} />
      </body>
    </html>
  )
}
