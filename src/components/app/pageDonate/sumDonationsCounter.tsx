'use client'

import { useMemo } from 'react'
import useSWR from 'swr'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { apiUrls } from '@/utils/shared/urls'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

interface SumDonationsCounterProps {
  initialData: SumDonations
  locale: SupportedLocale
}

export function SumDonationsCounter(props: SumDonationsCounterProps) {
  const { data } = useLiveSumDonations(props)
  const formatted = useMemo(() => {
    return intlNumberFormat(props.locale, {
      style: 'currency',
      currency: SupportedFiatCurrencyCodes.USD,
      maximumFractionDigits: 0,
    }).format(data.amountUsd)
  }, [props.locale, data.amountUsd])
  return <AnimatedNumericOdometer className="text-primary-cta" size={60} value={formatted} />
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
      fallbackData: {
        amountUsd: roundDownNumberToAnimateIn(initialData.amountUsd, 10000),
        fairshakeAmountUsd: roundDownNumberToAnimateIn(initialData.fairshakeAmountUsd, 10000),
      },
    },
  )
}
