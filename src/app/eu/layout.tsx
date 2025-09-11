import NextTopLoader from 'nextjs-toploader'

import { TopLevelClientLogic } from '@/app/[countryCode]/topLevelClientLogic'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { Toaster } from '@/components/ui/sonner'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { fontClassName } from '@/utils/web/fonts'

export default async function EuLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang={'eu'} translate="yes">
      <body className={fontClassName}>
        <NextTopLoader
          color="hsl(var(--primary-cta))"
          shadow="0 0 10px hsl(var(--primary-cta)),0 0 5px hsl(var(--primary-cta))"
          showSpinner={false}
        />
        <TopLevelClientLogic countryCode={'eu' as SupportedCountryCodes}>
          <FullHeight.Container>
            <Navbar
              countryCode={'eu' as SupportedCountryCodes}
              items={[
                {
                  href: '/eu/politicians',
                  text: 'Politician scores',
                },
                {
                  href: '/eu/polls',
                  text: 'Polls',
                },
                {
                  href: '/eu/manifesto',
                  text: 'Manifesto',
                },
              ]}
              logo={{
                src: '/au/logo/shield-text.svg',
                width: 120,
                height: 40,
              }}
            />
            <FullHeight.Content>{children}</FullHeight.Content>
          </FullHeight.Container>
        </TopLevelClientLogic>
        <Toaster />
      </body>
    </html>
  )
}
