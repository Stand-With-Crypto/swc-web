import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface CountryConfig {
  countryCode: SupportedCountryCodes
  navbar: NavbarProps
  footer: FooterProps
  GTM: boolean
}

const loadCountryConfig = async (countryCode: SupportedCountryCodes): Promise<CountryConfig> => {
  switch (countryCode) {
    case SupportedCountryCodes.AU:
      return (await import('./au')).auConfigs
    case SupportedCountryCodes.CA:
      return (await import('./ca')).caConfigs
    case SupportedCountryCodes.GB:
      return (await import('./gb')).gbConfigs
    default:
      return (await import('./default')).defaultConfigs
  }
}

export const getCountryConfig = (countryCode: SupportedCountryCodes) =>
  loadCountryConfig(countryCode)
