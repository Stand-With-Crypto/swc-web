import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedLocale } from '@/intl/locales'

export interface PageDonateProps {
  locale: SupportedLocale
  title: string
  description: string
  sumDonations: SumDonations
}
