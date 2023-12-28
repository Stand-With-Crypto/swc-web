'use client'

import _ from 'lodash'
import useSWRInfinite from 'swr/infinite'
import { LeaderboardEntity } from '@/data/sampleArchitecture/leaderboard'
import { apiUrls } from '@/utils/shared/urls'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { fetchReq } from '@/utils/shared/fetchReq'
import {
  ClientAnalyticActionType,
  ClientAnalyticComponentType,
  trackClientAnalytic,
} from '@/utils/web/clientAnalytics'

const useGetEntities = ({ limit }: { limit: number }) => {
  return useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.length) return null // reached the end
      return apiUrls.leaderboard((pageIndex + 1) * limit)
    },
    {
      initialSize: 0,
      revalidateFirstPage: false,
      fetcher: url =>
        fetchReq(url)
          .then(res => res.json())
          .then(data => data as LeaderboardEntity[]),
    },
  )
}

export function Leaderboard({
  initialEntities,
  locale,
}: {
  initialEntities: LeaderboardEntity[]
  locale: SupportedLocale
}) {
  const fetchLeaderboard = useGetEntities({ limit: initialEntities.length })
  const flattenedData = [...initialEntities, ..._.flatten(fetchLeaderboard.data)]
  return (
    <div>
      <h1>Leaderboard</h1>
      <Table className="border">
        <TableBody>
          {flattenedData.map(entity => (
            <TableRow key={entity.ownerAddress}>
              <TableCell>{entity.ownerEnsName || entity.ownerAddress}</TableCell>
              <TableCell className="text-right">
                <FormattedCurrency
                  locale={locale}
                  maximumFractionDigits={0}
                  currencyCode={SupportedFiatCurrencyCodes.USD}
                  amount={entity.usdDonationValue}
                />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="p-0" colSpan={2}>
              <button
                disabled={fetchLeaderboard.isValidating}
                className="w-full p-4"
                onClick={() => {
                  const size = fetchLeaderboard.size + 1
                  trackClientAnalytic('Leaderboard Load More Pressed', {
                    size,
                    component: ClientAnalyticComponentType.button,
                    action: ClientAnalyticActionType.click,
                  })
                  return fetchLeaderboard.setSize(size)
                }}
              >
                Load More
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
