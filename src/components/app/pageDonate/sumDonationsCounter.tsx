'use client'

import { useMemo } from 'react'
import useSWR from 'swr'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { roundDownNumberToAnimateIn } from '@/components/ui/animatedNumericOdometer/roundDownNumberToAnimateIn'
import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

interface SumDonationsCounterProps {
  initialData: SumDonations
  countryCode: SupportedCountryCodes
}

export function SumDonationsCounter(props: SumDonationsCounterProps) {
  const { data } = useLiveSumDonations(props)
  const formatted = useMemo(() => {
    return intlNumberFormat(COUNTRY_CODE_TO_LOCALE[props.countryCode], {
      style: 'currency',
      currency: SupportedFiatCurrencyCodes.USD,
      maximumFractionDigits: 0,
    }).format(data.amountUsd)
  }, [props.countryCode, data.amountUsd])
  return <AnimatedNumericOdometer className="text-primary-cta" size={60} value={formatted} />
}

function useLiveSumDonations({ countryCode, initialData }: SumDonationsCounterProps) {
  return useSWR(
    apiUrls.totalDonations(countryCode),
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
