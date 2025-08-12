import { GB_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/gb/constants'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { PageReferralsWrapper } from '@/components/app/pageReferrals/common'
import {
  ReferralsCounter,
  UserReferralsCount,
} from '@/components/app/pageReferrals/common/referralsCounter'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { GbPageReferralsHeading } from '@/components/app/pageReferrals/gb/heading'
import { GbAdvocatesLeaderboard } from '@/components/app/pageReferrals/gb/leaderboard'
import { GbUserConstituencyRank } from '@/components/app/pageReferrals/gb/userConstituencyRank'
import {
  GbYourConstituencyRank,
  GbYourConstituencyRankingWrapper,
  GbYourConstituencyRankSuspense,
} from '@/components/app/pageReferrals/gb/yourConstituencyRanking'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PageReferralsProps {
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  region?: string
  totalPages?: number
}

const countryCode = SupportedCountryCodes.GB as const

export function GbPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, region } = props

  const tab = GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES
  const urls = getIntlUrls(countryCode)
  const totalPages = props.totalPages || GB_COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageReferralsWrapper>
      <GbPageReferralsHeading regionName={region} />

      <GbYourConstituencyRankingWrapper>
        <GbYourConstituencyRankSuspense>
          <UserAddressProvider countryCode={countryCode} filterByAdministrativeArea={!!region}>
            {!region && (
              <>
                <UserReferralUrlWithApi />
                <ReferralsCounter>
                  <UserReferralsCount />
                  <GbUserConstituencyRank />
                </ReferralsCounter>
              </>
            )}

            <GbYourConstituencyRank />
          </UserAddressProvider>
        </GbYourConstituencyRankSuspense>
      </GbYourConstituencyRankingWrapper>
      <GbAdvocatesLeaderboard data={leaderboardData} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber => urls.referrals({ pageNum: pageNumber, stateCode: region })}
          totalPages={totalPages}
        />
      </div>
    </PageReferralsWrapper>
  )
}
