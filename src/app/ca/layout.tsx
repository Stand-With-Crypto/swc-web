import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { getCountryConfig } from '@/configs'

const countryCode = SupportedCountryCodes.CA

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function CaLayout({ children }: React.PropsWithChildren) {
  const countryConfig = getCountryConfig(countryCode)

  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...countryConfig.footer} />}
      navbar={<Navbar {...countryConfig.navbar} />}
      shouldRenderGTM={countryConfig.GTM}
    >
      {children}
    </PageLayout>
  )
}
