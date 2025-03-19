import { Metadata } from 'next'

import { PageLayout } from '@/components/app/layout/layout'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function GbLayout({ children }: React.PropsWithChildren) {
  return <PageLayout countryCode={countryCode}>{children}</PageLayout>
}
