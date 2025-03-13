import { Metadata } from 'next'

import { BuilderLayout } from '@/components/app/builder/builderLayout'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function GbLayout({ children }: React.PropsWithChildren) {
  return <BuilderLayout countryCode={countryCode}>{children}</BuilderLayout>
}
