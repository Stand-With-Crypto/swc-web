import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type UserActionFormFollowLinkedInProps = {
  countryCode: SupportedCountryCodes
  onClose: () => void
}
