import { getFooterConfig, getNavbarConfig } from 'src/app/eu/config'

import { Footer } from '@/components/app/footer'
import { PageLayout } from '@/components/app/layout/layout'
import { Navbar } from '@/components/app/navbar'
import { EuNavbarGlobalBanner } from '@/components/app/navbarGlobalBanner/eu'
import { generateCountryCodeLayoutMetadataWithLanguage } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.EU

export const generateMetadata = ({ params: { language } }: { params: { language: string } }) => {
  return generateCountryCodeLayoutMetadataWithLanguage(countryCode, language)
}

export default async function EuLayout({
  children,
  params,
}: React.PropsWithChildren & { params: { language: SupportedEULanguages } }) {
  const { language } = await params

  const navbarConfig = getNavbarConfig({ language })
  const footerConfig = getFooterConfig({ language })

  return (
    <PageLayout
      countryCode={countryCode}
      footer={<Footer {...footerConfig} />}
      globalBanner={<EuNavbarGlobalBanner />}
      navbar={<Navbar {...navbarConfig} />}
    >
      {children}
    </PageLayout>
  )
}
