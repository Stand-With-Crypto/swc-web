'use client'

import _ from 'lodash'
import useSWRInfinite from 'swr/infinite'
import { LeaderboardEntity } from '@/data/leaderboard'
import { apiUrls } from '@/utils/shared/urls'
import { Table, TableBody, TableCell, TableRow } from '../ui/table'

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
        fetch(url)
          .then(res => res.json())
          .then(data => data as LeaderboardEntity[]),
    },
  )
}

export function Leaderboard({ initialEntities }: { initialEntities: LeaderboardEntity[] }) {
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
              <TableCell className="text-right">{entity.fiatDonationValue}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="p-0" colSpan={2}>
              <button
                disabled={fetchLeaderboard.isValidating}
                className="w-full p-4"
                onClick={() => fetchLeaderboard.setSize(fetchLeaderboard.size + 1)}
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
