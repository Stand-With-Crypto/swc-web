import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface DistrictLeaderboardContentProps extends React.PropsWithChildren {
  countryCode: SupportedCountryCodes
  data: DistrictRankingEntryWithRank[]
}

interface DistrictLeaderboardButtonProps extends React.PropsWithChildren {
  href: string
}

export function DistrictLeaderboard({ children }: React.PropsWithChildren) {
  return <div className="space-y-8">{children}</div>
}

function DistrictLeaderboardContent({ countryCode, data }: DistrictLeaderboardContentProps) {
  return (
    <>
      <YourDistrictRank filteredByState />
      <DistrictsLeaderboard countryCode={countryCode} data={data} />
    </>
  )
}
DistrictLeaderboard.Content = DistrictLeaderboardContent

function DistrictLeaderboardButton({ children, href }: DistrictLeaderboardButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
DistrictLeaderboard.Button = DistrictLeaderboardButton
