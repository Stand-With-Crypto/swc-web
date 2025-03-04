import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { FullHeight } from '@/components/ui/fullHeight'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function GbLayout({ children }: React.PropsWithChildren) {
  return (
    <PageLayout countryCode={countryCode}>
      <Navbar countryCode={countryCode} />
      <FullHeight.Content>{children}</FullHeight.Content>
      <Footer countryCode={countryCode} />
    </PageLayout>
  )
}
