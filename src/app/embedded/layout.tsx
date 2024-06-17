import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import { Metadata } from 'next'

import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'
import { getOpenGraphImageUrl } from '@/utils/server/generateOpenGraphImageUrl'
import { generateMetadataDetails, TOP_LEVEL_METADATA_DETAILS } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { fontClassName } from '@/utils/web/fonts'

export { viewport } from '@/utils/server/metadataUtils'

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

export default function Layout({ children }: PageProps & { children: React.ReactNode }) {
  return (
    <html lang={SupportedLocale.EN_US}>
      <body className={fontClassName}>
        <OverrideGlobalLocalStorage />
        <FullHeight.Container>
          <FullHeight.Content>{children}</FullHeight.Content>
        </FullHeight.Container>
        <SpeedInsights debug={false} sampleRate={0.01} />
      </body>
    </html>
  )
}
