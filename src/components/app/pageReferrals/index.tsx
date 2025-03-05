import { PageReferralsHeading } from '@/components/app/pageReferrals/heading'
import { ReferralLeaderboard } from '@/components/app/pageReferrals/referralLeaderboard'
import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/userReferralUrl'
import { DistrictRankingEntry } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageBillsProps {
  countryCode: SupportedCountryCodes
  districtRankings: DistrictRankingEntry[]
}

export function PageReferrals(props: PageBillsProps) {
  const { districtRankings } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-8">
      <PageReferralsHeading />

      <UserReferralUrlWithApi />

      <ReferralsCounter />

      <YourDistrictRank />

      <section>
        <ReferralLeaderboard districtRankings={districtRankings} />
      </section>
    </div>
  )
}
