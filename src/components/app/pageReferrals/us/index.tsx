import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import {
  ReferralsCounter,
  UserElectoralZoneRank,
  UserReferralsCount,
} from '@/components/app/pageReferrals/common/referralsCounter'
import { PageReferralsHeading } from '@/components/app/pageReferrals/us/heading'
import { USAdvocatesLeaderboard } from '@/components/app/pageReferrals/us/leaderboard'
import { UsYourDistrictRank } from '@/components/app/pageReferrals/us/yourDistrictRanking'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PageReferralsProps {
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  stateCode?: string
  totalPages?: number
}

const COUNTRY_CODE = SupportedCountryCodes.US as const

export function UsPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, stateCode } = props

  const tab = RecentActivityAndLeaderboardTabs.TOP_DISTRICTS
  const urls = getIntlUrls(COUNTRY_CODE)
  const totalPages = props.totalPages || COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <div className="standard-spacing-from-navbar container space-y-8">
      <PageReferralsHeading
        stateName={stateCode ? getUSStateNameFromStateCode(stateCode) : undefined}
      />
      {!stateCode && (
        <>
          <UserReferralUrlWithApi />
          <ReferralsCounter>
            <UserReferralsCount />
            <UserElectoralZoneRank countryCode={COUNTRY_CODE} />
          </ReferralsCounter>
        </>
      )}

      <UsYourDistrictRank filteredByState={!!stateCode} />
      <USAdvocatesLeaderboard data={leaderboardData} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber => urls.referrals({ pageNum: pageNumber, stateCode })}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
