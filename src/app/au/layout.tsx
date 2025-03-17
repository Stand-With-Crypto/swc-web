import { Metadata } from 'next'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { footerConfig, navbarConfig } from './config'

const countryCode = SupportedCountryCodes.AU

export const metadata: Metadata = generateCountryCodeLayoutMetadata(countryCode)

export default async function AuLayout({ children }: React.PropsWithChildren) {
  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
