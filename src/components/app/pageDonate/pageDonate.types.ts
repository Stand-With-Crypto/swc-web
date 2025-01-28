import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

export interface PageDonateProps {
  locale: SupportedLocale
  title: string
  description: string
  sumDonations: SumDonations
}
