'use client'

import _ from 'lodash'
import useSWR from 'swr'
import { LeaderboardEntity } from '@/data/leaderboard'
import { apiUrls } from '@/utils/shared/urls'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { TotalDonations } from '@/data/donations/getTotalDonations'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { SupportedLocale } from '@/intl/locales'
import { fetchReq } from '@/utils/shared/fetchReq'

const useGetTotalDonations = (locale: SupportedLocale) => {
  return useSWR(
    apiUrls.totalDonations(locale),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as TotalDonations),
    {
      refreshInterval: 1000,
    },
  )
}

export function LiveUpdatingTotalDonations({
  totalDonations,
  locale,
}: {
  totalDonations: TotalDonations
  locale: SupportedLocale
}) {
  const dynamicTotalDonations = useGetTotalDonations(locale)
  const usedTotalDonations = dynamicTotalDonations.data ?? totalDonations
  return (
    <>
      <FormattedCurrency
        locale={locale}
        amount={usedTotalDonations.amountLocal}
        currencyCode={usedTotalDonations.currencyCode}
      />
    </>
  )
}
