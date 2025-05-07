import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface UserActionFormShareOnTwitterProps {
  countryCode: SupportedCountryCodes
  onClose: () => void
}
