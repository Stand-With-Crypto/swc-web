import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type UserActionFormShareOnTwitterProps = {
  onClose: () => void
  countryCode: SupportedCountryCodes
}
