import { SpeedInsights } from '@vercel/speed-insights/next'
import { capitalize } from 'lodash-es'
import { Metadata, Viewport } from 'next'

import { OverrideGlobalLocalStorage } from '@/components/app/overrideGlobalLocalStorage'
import { FullHeight } from '@/components/ui/fullHeight'
import { PageProps } from '@/types'
import { viewport as defaultViewport } from '@/utils/server/metadataUtils'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { fontClassName } from '@/utils/web/fonts'
import { Toaster } from '@/components/ui/sonner'

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

export default function Layout({ children }: PageProps & { children: React.ReactNode }) {
  return (
    <html lang={SupportedLocale.EN_US} translate="no">
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
