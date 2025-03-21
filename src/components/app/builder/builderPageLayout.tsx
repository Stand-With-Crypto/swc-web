import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageDetails } from '@/utils/server/builder/models/page/utils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { getCountryConfig } from '@/configs'

export async function BuilderPageLayout({
  children,
  countryCode,
  pathname,
  modelName,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  pathname: string
  modelName: BuilderPageModelIdentifiers
}) {
  const pageMetadata = await getPageDetails(modelName, pathname, countryCode)

  const countryConfig = await getCountryConfig(countryCode)

  return (
    <>
      {pageMetadata.hasNavbar && <Navbar {...countryConfig.navbar} />}
      {children}
      {pageMetadata.hasFooter && <Footer {...countryConfig.footer} />}
    </>
  )
}
