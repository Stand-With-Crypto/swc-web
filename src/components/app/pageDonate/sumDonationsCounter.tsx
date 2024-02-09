'use client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { useMemo } from 'react'
import useSWR from 'swr'

interface SumDonationsCounterProps {
  initialData: SumDonations
  locale: SupportedLocale
}

export function SumDonationsCounter(props: SumDonationsCounterProps) {
  const { data } = useLiveSumDonations(props)
  const formatted = useMemo(() => {
    return new Intl.NumberFormat(props.locale, {
      currency: SupportedFiatCurrencyCodes.USD,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(data.amountUsd)
  }, [props.locale, data.amountUsd])
  return <AnimatedNumericOdometer size={60} value={formatted} />
}

function useLiveSumDonations({ locale, initialData }: SumDonationsCounterProps) {
  return useSWR(
    apiUrls.totalDonations(locale),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as SumDonations),
    {
      fallbackData: { amountUsd: roundDownNumberToAnimateIn(initialData.amountUsd, 10000) },
      refreshInterval: 5 * 1000,
    },
  )
}
