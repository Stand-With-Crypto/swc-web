import { CA_COMMUNITY_PAGINATION_DATA } from '@/components/app/pageCommunity/ca/constants'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/ca/recentActivityAndLeaderboardTabs'
import { PageReferralsWrapper } from '@/components/app/pageReferrals'
import { CaPageReferralsHeading } from '@/components/app/pageReferrals/ca/heading'
import { CaAdvocatesLeaderboard } from '@/components/app/pageReferrals/ca/leaderboard'
import { CaUserConstituencyRank } from '@/components/app/pageReferrals/ca/userConstituencyRank'
import { CaYourConstituencyRank } from '@/components/app/pageReferrals/ca/yourConstituencyRanking'
import {
  ReferralsCounter,
  UserReferralsCount,
} from '@/components/app/pageReferrals/referralsCounter'
import { UserAddressProvider } from '@/components/app/pageReferrals/userAddress.context'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/common/userReferralUrl'
import { PaginationLinks } from '@/components/ui/paginationLinks'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface PageReferralsProps {
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  provinceCode?: string
  totalPages?: number
}

const COUNTRY_CODE = SupportedCountryCodes.CA

export function CaPageReferrals(props: PageReferralsProps) {
  const { page, leaderboardData, provinceCode } = props
  const tab = RecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES
  const urls = getIntlUrls(COUNTRY_CODE)
  const totalPages = props.totalPages || CA_COMMUNITY_PAGINATION_DATA[tab].totalPages

  return (
    <PageReferralsWrapper>
      <CaPageReferralsHeading
        stateName={provinceCode ? getCAProvinceOrTerritoryNameFromCode(provinceCode) : undefined}
      />
      <UserAddressProvider countryCode={COUNTRY_CODE} filterByAdministrativeArea={!!provinceCode}>
        {!provinceCode && (
          <>
            <UserReferralUrlWithApi />
            <ReferralsCounter>
              <UserReferralsCount />
              <CaUserConstituencyRank />
            </ReferralsCounter>
          </>
        )}

        <CaYourConstituencyRank filteredByProvinceOrTerritory={!!provinceCode} />
      </UserAddressProvider>
      <CaAdvocatesLeaderboard data={leaderboardData} />
      <div className="flex justify-center">
        <PaginationLinks
          currentPageNumber={page}
          getPageUrl={pageNumber =>
            urls.referrals({ pageNum: pageNumber, stateCode: provinceCode })
          }
          totalPages={totalPages}
        />
      </div>
    </PageReferralsWrapper>
  )
}
