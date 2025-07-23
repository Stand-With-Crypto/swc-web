import { AU_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/au/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { PageReferralsWrapper } from '@/components/app/pageReferrals'
import { AuPageReferralsHeading } from '@/components/app/pageReferrals/au/heading'
import { AuAdvocatesLeaderboard } from '@/components/app/pageReferrals/au/leaderboard'
import { AuYourDivisionRank } from '@/components/app/pageReferrals/au/yourDivisionRanking'
import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PageReferralsProps {
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  stateCode?: string
  totalPages?: number
}

const COUNTRY_CODE = SupportedCountryCodes.AU as const

export function AuPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, stateCode } = props

  const tab = RecentActivityAndLeaderboardTabs.TOP_DIVISIONS
  const urls = getIntlUrls(COUNTRY_CODE)
  const totalPages = props.totalPages || AU_COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageReferralsWrapper>
      <AuPageReferralsHeading
        stateName={stateCode ? getAUStateNameFromStateCode(stateCode) : undefined}
      />
      {!stateCode && (
        <>
          <UserReferralUrlWithApi />
          <ReferralsCounter>
            <ReferralsCounter.UserReferralsCount />
            <ReferralsCounter.AuUserDivisionRank />
          </ReferralsCounter>
        </>
      )}

      <AuYourDivisionRank filteredByState={!!stateCode} />
      <AuAdvocatesLeaderboard data={leaderboardData} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber => urls.referrals({ pageNum: pageNumber, stateCode })}
          totalPages={totalPages}
        />
      </div>
    </PageReferralsWrapper>
  )
}
