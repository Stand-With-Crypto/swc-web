import { Metadata } from 'next'

import { getNavbarItems } from '@/app/au/constants'
import { PageLayout } from '@/components/app/layout/layout'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function AuLayout({ children }: React.PropsWithChildren) {
  const navbarItems = getNavbarItems(countryCode)

  return (
    <PageLayout countryCode={countryCode} navbarItems={navbarItems}>
      {children}
    </PageLayout>
  )
}
