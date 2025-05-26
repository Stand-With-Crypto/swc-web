import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface ReferralLeaderboardContentProps extends React.PropsWithChildren {
  countryCode: SupportedCountryCodes
  data: DistrictRankingEntryWithRank[]
}

interface ReferralLeaderboardButtonProps extends React.PropsWithChildren {
  href: string
}

export function ReferralLeaderboard({ children }: React.PropsWithChildren) {
  return <div className="standard-spacing-from-navbar space-y-8">{children}</div>
}

function ReferralLeaderboardContent({ countryCode, data }: ReferralLeaderboardContentProps) {
  return (
    <>
      <YourDistrictRank />
      <DistrictsLeaderboard countryCode={countryCode} data={data} />
    </>
  )
}
ReferralLeaderboard.Content = ReferralLeaderboardContent

function ReferralLeaderboardButton({ children, href }: ReferralLeaderboardButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
ReferralLeaderboard.Button = ReferralLeaderboardButton
