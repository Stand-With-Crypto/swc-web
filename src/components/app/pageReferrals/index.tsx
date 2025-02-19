import { PageReferralsHeading } from '@/components/app/pageReferrals/heading'
import { PaginatedDistrictsLeaderboard } from '@/components/app/pageReferrals/paginatedReferralLeaderboard'
import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/userReferralUrl'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageReferralsProps {
  leaderboardData: DistrictRankingEntryWithRank[]
  page: number
  countryCode: SupportedCountryCodes
}

export function PageReferrals(props: PageReferralsProps) {
  const { leaderboardData, page, countryCode } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-8">
      <PageReferralsHeading />
      <UserReferralUrlWithApi />
      <ReferralsCounter />
      <YourDistrictRank />
      <PaginatedDistrictsLeaderboard countryCode={countryCode} data={leaderboardData} page={page} />
    </div>
  )
}
