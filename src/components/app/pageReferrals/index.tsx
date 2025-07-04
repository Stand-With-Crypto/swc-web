import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { PageReferralsHeading } from '@/components/app/pageReferrals/heading'
import {
  ReferralsCounter,
  UserDistrictRank,
  UserReferralsCount,
} from '@/components/app/pageReferrals/referralsCounter'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PageReferralsProps {
  countryCode: SupportedCountryCodes
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  stateCode?: string
  totalPages?: number
}

export function PageReferrals(props: PageReferralsProps) {
  const { countryCode, page, leaderboardData, stateCode } = props
  const tab = RecentActivityAndLeaderboardTabs.TOP_DISTRICTS
  const urls = getIntlUrls(countryCode)
  const totalPages = props.totalPages || COMMUNITY_PAGINATION_DATA[tab].totalPages

  const stateNameResolver = getStateNameResolver(countryCode)

  return (
    <div className="standard-spacing-from-navbar container space-y-8">
      <PageReferralsHeading stateName={stateCode ? stateNameResolver(stateCode) : undefined} />
      {!stateCode && (
        <>
          <UserReferralUrlWithApi />
          <ReferralsCounter>
            <UserReferralsCount />
            <UserDistrictRank />
          </ReferralsCounter>
        </>
      )}

      <YourDistrictRank filteredByState={!!stateCode} />
      <DistrictsLeaderboard countryCode={countryCode} data={leaderboardData} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber =>
            pageNumber < 1 || pageNumber > totalPages
              ? ''
              : urls.leaderboard({ pageNum: pageNumber, stateCode, tab })
          }
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
