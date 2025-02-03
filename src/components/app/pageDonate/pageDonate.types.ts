import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PageDonateProps {
  countryCode: SupportedCountryCodes
  title: string
  description: string
  sumDonations: SumDonations
}
