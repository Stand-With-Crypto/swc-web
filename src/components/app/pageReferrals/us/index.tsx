import { US_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/us/constants'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { PageReferralsWrapper } from '@/components/app/pageReferrals/common'
import {
  ReferralsCounter,
  UserReferralsCount,
} from '@/components/app/pageReferrals/common/referralsCounter'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { UsPageReferralsHeading } from '@/components/app/pageReferrals/us/heading'
import { USAdvocatesLeaderboard } from '@/components/app/pageReferrals/us/leaderboard'
import { UsUserDistrictRank } from '@/components/app/pageReferrals/us/userDistrictRank'
import {
  UsYourDistrictRank,
  UsYourDistrictRankingWrapper,
  UsYourDistrictRankSuspense,
} from '@/components/app/pageReferrals/us/yourDistrictRanking'
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

const countryCode = SupportedCountryCodes.US as const

export function UsPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, stateCode } = props

  const tab = UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS
  const urls = getIntlUrls(countryCode)
  const totalPages = props.totalPages || US_COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageReferralsWrapper>
      <UsPageReferralsHeading
        stateName={stateCode ? getUSStateNameFromStateCode(stateCode) : undefined}
      />
      <UsYourDistrictRankingWrapper>
        <UsYourDistrictRankSuspense>
          <UserAddressProvider countryCode={countryCode} filterByAdministrativeArea={!!stateCode}>
            {!stateCode && (
              <>
                <UserReferralUrlWithApi />
                <ReferralsCounter>
                  <UserReferralsCount />
                  <UsUserDistrictRank />
                </ReferralsCounter>
              </>
            )}

            <UsYourDistrictRank />
          </UserAddressProvider>
        </UsYourDistrictRankSuspense>
      </UsYourDistrictRankingWrapper>
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
