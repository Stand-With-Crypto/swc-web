import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface UserActionFormReferProps {
  countryCode: SupportedCountryCodes
  onClose?: () => void
}
