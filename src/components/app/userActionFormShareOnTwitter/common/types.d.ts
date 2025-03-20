import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type UserActionFormShareOnTwitterProps = {
  countryCode: SupportedCountryCodes
  onClose: () => void
}
