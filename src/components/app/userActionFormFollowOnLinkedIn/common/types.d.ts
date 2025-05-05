import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface UserActionFormFollowLinkedInProps {
  countryCode: SupportedCountryCodes
  onClose: () => void
}
