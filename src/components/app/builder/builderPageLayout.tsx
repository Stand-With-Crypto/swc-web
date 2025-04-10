import { Footer, FooterProps } from '@/components/app/footer'
import { Navbar, NavbarProps } from '@/components/app/navbar'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageDetails } from '@/utils/server/builder/models/page/utils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const navbarConfigsByCountry: Record<SupportedCountryCodes, Promise<NavbarProps>> = {
  [SupportedCountryCodes.AU]: import('@/app/au/config').then(module => module.navbarConfig),
  [SupportedCountryCodes.GB]: import('@/app/gb/config').then(module => module.navbarConfig),
  [SupportedCountryCodes.CA]: import('@/app/ca/config').then(module => module.navbarConfig),
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: import('@/app/[countryCode]/config').then(
    module => module.navbarConfig,
  ),
}

const footerConfigsByCountry: Record<SupportedCountryCodes, Promise<FooterProps>> = {
  [SupportedCountryCodes.AU]: import('@/app/au/config').then(module => module.footerConfig),
  [SupportedCountryCodes.GB]: import('@/app/gb/config').then(module => module.footerConfig),
  [SupportedCountryCodes.CA]: import('@/app/ca/config').then(module => module.footerConfig),
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: import('@/app/[countryCode]/config').then(
    module => module.footerConfig,
  ),
}

const getNavbarConfig = (countryCode: SupportedCountryCodes) => navbarConfigsByCountry[countryCode]

const getFooterConfig = (countryCode: SupportedCountryCodes) => footerConfigsByCountry[countryCode]

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

  const navbarConfig = await getNavbarConfig(countryCode)

  const footerConfig = await getFooterConfig(countryCode)

  return (
    <>
      {pageMetadata.hasNavbar && <Navbar {...navbarConfig} />}
      {children}
      {pageMetadata.hasFooter && <Footer {...footerConfig} />}
    </>
  )
}
