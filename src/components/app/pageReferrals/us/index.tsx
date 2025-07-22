'use client'

import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/common/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageReferralsWrapper } from '@/components/app/pageReferrals'
import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { UsPageReferralsHeading } from '@/components/app/pageReferrals/us/heading'
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
    <PageReferralsWrapper>
      <UsPageReferralsHeading
        stateName={stateCode ? getUSStateNameFromStateCode(stateCode) : undefined}
      />
      {!stateCode && (
        <>
          <UserReferralUrlWithApi />
          <ReferralsCounter>
            <ReferralsCounter.UserReferralsCount />
            <ReferralsCounter.UsUserDistrictRank />
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
    </PageReferralsWrapper>
  )
}
