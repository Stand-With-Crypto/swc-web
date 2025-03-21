import { FooterProps } from '@/components/app/footer'
import { NavbarProps } from '@/components/app/navbar'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { auConfigs } from './au'
import { caConfigs } from './ca'
import { defaultConfigs } from './default'
import { gbConfigs } from './gb'

export interface CountryConfig {
  countryCode: SupportedCountryCodes
  navbar: NavbarProps
  footer: FooterProps
  GTM: boolean
}

const countryConfigs: Record<SupportedCountryCodes, CountryConfig> = {
  [SupportedCountryCodes.AU]: auConfigs,
  [SupportedCountryCodes.CA]: caConfigs,
  [SupportedCountryCodes.GB]: gbConfigs,
  [DEFAULT_SUPPORTED_COUNTRY_CODE]: defaultConfigs,
}

export const getCountryConfig = (countryCode: SupportedCountryCodes) => countryConfigs[countryCode]
