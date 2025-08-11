import { AU_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/au/constants'
import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { AuPageReferralsHeading } from '@/components/app/pageReferrals/au/heading'
import { AuAdvocatesLeaderboard } from '@/components/app/pageReferrals/au/leaderboard'
import { AuUserDivisionRank } from '@/components/app/pageReferrals/au/userDivisionRank'
import {
  AuYourDivisionRank,
  AuYourDivisionRankingWrapper,
  AuYourDivisionRankSuspense,
} from '@/components/app/pageReferrals/au/yourDivisionRanking'
import { PageReferralsWrapper } from '@/components/app/pageReferrals/common'
import {
  ReferralsCounter,
  UserReferralsCount,
} from '@/components/app/pageReferrals/common/referralsCounter'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
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

const countryCode = SupportedCountryCodes.AU as const

export function AuPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, stateCode } = props

  const tab = AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS
  const urls = getIntlUrls(countryCode)
  const totalPages = props.totalPages || AU_COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageReferralsWrapper>
      <AuPageReferralsHeading
        stateName={stateCode ? getAUStateNameFromStateCode(stateCode) : undefined}
      />

      <AuYourDivisionRankingWrapper>
        <AuYourDivisionRankSuspense>
          <UserAddressProvider countryCode={countryCode} filterByAdministrativeArea={!!stateCode}>
            {!stateCode && (
              <>
                <UserReferralUrlWithApi />
                <ReferralsCounter>
                  <UserReferralsCount />
                  <AuUserDivisionRank />
                </ReferralsCounter>
              </>
            )}

            <AuYourDivisionRank />
          </UserAddressProvider>
        </AuYourDivisionRankSuspense>
      </AuYourDivisionRankingWrapper>
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
