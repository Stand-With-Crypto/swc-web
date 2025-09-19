import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

export interface EventsPageProps {
  events: SWCEvents | null
  countryCode: SupportedCountryCodes
  isDeepLink?: boolean
}
