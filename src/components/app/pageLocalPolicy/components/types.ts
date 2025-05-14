import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface LocalPolicyStatePageProps {
  countryCode: SupportedCountryCodes
  stateCode: string
}

export interface HeaderSectionProps {
  countryCode: SupportedCountryCodes
  stateCode: string
  stateName: string
}

export interface PoliticiansSectionProps {
  countryCode: SupportedCountryCodes
  stateCode: string
  stateName: string
}
