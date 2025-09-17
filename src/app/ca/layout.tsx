import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { CaNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/ca'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { getFooterConfig, getNavbarConfig } from './config'

const countryCode = SupportedCountryCodes.CA

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function CaLayout({ children }: React.PropsWithChildren) {
  const navbarConfig = getNavbarConfig()
  const footerConfig = getFooterConfig()

  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      globalBanner={<CaNavbarGlobalBanner />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
