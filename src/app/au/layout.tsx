import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { AuNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/au'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { getFooterConfig, getNavbarConfig } from './config'

const countryCode = SupportedCountryCodes.AU

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function AuLayout({ children }: React.PropsWithChildren) {
  const navbarConfig = getNavbarConfig()
  const footerConfig = getFooterConfig()

  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      globalBanner={<AuNavbarGlobalBanner />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
