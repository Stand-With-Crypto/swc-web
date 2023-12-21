'use client'

import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { AggregateDonations } from '@/data/donations/getAggregateDonations'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import useSWR from 'swr'

const useGetTotalDonations = (locale: SupportedLocale) => {
  return useSWR(
    apiUrls.totalDonations(locale),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as AggregateDonations),
    {
      refreshInterval: 1000,
    },
  )
}

export function LiveUpdatingTotalDonations({
  totalDonations,
  locale,
}: {
  totalDonations: AggregateDonations
  locale: SupportedLocale
}) {
  const dynamicTotalDonations = useGetTotalDonations(locale)
  // There's an edge case where the page version is a more recent cache that the API, and so the number could go down, which we don't want obviously
  const usedTotalDonations =
    dynamicTotalDonations.data && dynamicTotalDonations.data > totalDonations
      ? dynamicTotalDonations.data
      : totalDonations
  return (
    <>
      <FormattedCurrency
        locale={locale}
        maximumFractionDigits={0}
        amount={usedTotalDonations.amountUsd}
        currencyCode={SupportedFiatCurrencyCodes.USD}
      />
    </>
  )
}
