import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export interface CountryConfig {
  countryCode: SupportedCountryCodes
  navbar: NavbarProps
  footer: FooterProps
  GTM: boolean
}

const configs: Record<SupportedCountryCodes, Promise<CountryConfig>> = {
  [SupportedCountryCodes.AU]: import('./au').then(m => m.auConfigs),
  [SupportedCountryCodes.CA]: import('./ca').then(m => m.caConfigs),
  [SupportedCountryCodes.GB]: import('./gb').then(m => m.gbConfigs),
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: import('./default').then(m => m.defaultConfigs),
}

export const getCountryConfig = (countryCode: SupportedCountryCodes) => configs[countryCode]
