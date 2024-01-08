'use client'

import { AnimatedCurrencyOdometer } from '@/components/ui/animatedCurrencyOdometer'
import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedLocale } from '@/intl/locales'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

interface SumDonationsCounterProps {
  initialData: SumDonations
  locale: SupportedLocale
}

export function SumDonationsCounter(props: SumDonationsCounterProps) {
  const { data } = useLiveSumDonations(props)

  return <AnimatedCurrencyOdometer value={data?.amountUsd} />
}

function useLiveSumDonations({ locale, initialData }: SumDonationsCounterProps) {
  return useSWR(
    apiUrls.totalDonations(locale),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as SumDonations),
    {
      refreshInterval: 5 * 1000,
      fallbackData: initialData,
    },
  )
}
