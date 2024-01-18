'use client'

import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { SumDonations } from '@/data/aggregations/getSumDonations'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

const useGetTotalDonations = (locale: SupportedLocale) => {
  return useSWR(
    apiUrls.mockTotalDonations(locale),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as SumDonations),
    {
      refreshInterval: 1000,
    },
  )
}

export function LiveUpdatingTotalDonations({
  totalDonations,
  locale,
}: {
  totalDonations: SumDonations
  locale: SupportedLocale
}) {
  const dynamicTotalDonations = useGetTotalDonations(locale)
  return (
    <>
      <FormattedCurrency
        locale={locale}
        maximumFractionDigits={0}
        amount={dynamicTotalDonations.data?.amountUsd ?? totalDonations.amountUsd}
        currencyCode={SupportedFiatCurrencyCodes.USD}
      />
    </>
  )
}
