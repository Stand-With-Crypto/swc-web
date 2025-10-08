import { Footer } from '@/components/app/footer'
import { Navbar } from '@/components/app/navbar'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageDetails } from '@/utils/server/builder/models/page/utils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const navbarConfigsByCountry = {
  [SupportedCountryCodes.AU]: import('@/app/au/config').then(module => module.getNavbarConfig),
  [SupportedCountryCodes.GB]: import('@/app/gb/config').then(module => module.getNavbarConfig),
  [SupportedCountryCodes.CA]: import('@/app/ca/config').then(module => module.getNavbarConfig),
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: import('@/app/[countryCode]/config').then(
    module => module.getNavbarConfig,
  ),
  [SupportedCountryCodes.EU]: import('@/app/eu/config').then(module => module.getNavbarConfig),
} as const

const footerConfigsByCountry = {
  [SupportedCountryCodes.AU]: import('@/app/au/config').then(module => module.getFooterConfig),
  [SupportedCountryCodes.GB]: import('@/app/gb/config').then(module => module.getFooterConfig),
  [SupportedCountryCodes.CA]: import('@/app/ca/config').then(module => module.getFooterConfig),
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: import('@/app/[countryCode]/config').then(
    module => module.getFooterConfig,
  ),
  [SupportedCountryCodes.EU]: import('@/app/eu/config').then(module => module.getFooterConfig),
} as const

const getNavbarConfig = (countryCode: SupportedCountryCodes) => navbarConfigsByCountry[countryCode]

const getFooterConfig = (countryCode: SupportedCountryCodes) => footerConfigsByCountry[countryCode]

export async function BuilderPageLayout({
  children,
  countryCode,
  pathname,
  modelName,
  language = SupportedLanguages.EN,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  pathname: string
  modelName: BuilderPageModelIdentifiers
  language?: SupportedLanguages
}) {
  const pageMetadata = await getPageDetails(modelName, pathname, countryCode, language)

  const navbarConfigFn = await getNavbarConfig(countryCode)
  const navbarConfig =
    countryCode === SupportedCountryCodes.EU ? navbarConfigFn({ language }) : navbarConfigFn()

  const footerConfigFn = await getFooterConfig(countryCode)
  const footerConfig =
    countryCode === SupportedCountryCodes.EU ? footerConfigFn({ language }) : footerConfigFn()

  return (
    <>
      {pageMetadata.hasNavbar && <Navbar {...navbarConfig} />}
      {children}
      {pageMetadata.hasFooter && <Footer {...footerConfig} />}
    </>
  )
}
