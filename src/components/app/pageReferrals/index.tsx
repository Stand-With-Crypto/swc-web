import { ReferralLeaderboard } from '@/components/app/pageReferrals/referralLeaderboard'
import { ReferralsCounter } from '@/components/app/pageReferrals/referralsCounter'
import { UserReferralUrlWithApi } from '@/components/app/pageUserProfile/userReferralUrl'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DistrictRankingEntry } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PageBillsProps {
  countryCode: SupportedCountryCodes
  districtRankings: DistrictRankingEntry[]
}

export function PageReferrals(props: PageBillsProps) {
  const { districtRankings } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-7 text-center">
        <PageTitle>
          Invite a friend to join
          <br />
          <span className="inline-block">Stand With Crypto</span>
        </PageTitle>
        <PageSubTitle>
          Send your friends your unique referral code to encourage them to signup and take action
        </PageSubTitle>
      </section>

      <UserReferralUrlWithApi />

      <ReferralsCounter />

      <section>
        <ReferralLeaderboard districtRankings={districtRankings} />
      </section>
    </div>
  )
}
