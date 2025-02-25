import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageDetails } from '@/utils/server/builder/models/page/utils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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

  return (
    <>
      {pageMetadata.hasNavbar && <Navbar countryCode={countryCode} />}
      {children}
      {pageMetadata.hasFooter && <Footer countryCode={countryCode} />}
    </>
  )
}
