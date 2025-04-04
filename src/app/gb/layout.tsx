import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { GbNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/gb'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { footerConfig, navbarConfig } from './config'

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function GbLayout({ children }: React.PropsWithChildren) {
  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      globalBanner={<GbNavbarGlobalBanner />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
