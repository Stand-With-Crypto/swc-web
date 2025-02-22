'use client'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PaginatedDistrictsLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
  page: number
  countryCode: SupportedCountryCodes
}

export function PaginatedDistrictsLeaderboard({
  data,
  page,
  countryCode,
}: PaginatedDistrictsLeaderboardProps) {
  const urls = getIntlUrls(countryCode)
  const { totalPages } = COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.TOP_DISTRICTS]

  return (
    <div className="space-y-6">
      <DistrictsLeaderboard countryCode={countryCode} data={data} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber =>
            pageNumber < 1 || pageNumber > totalPages ? '' : urls.referrals({ pageNum: pageNumber })
          }
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
