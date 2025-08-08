import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { LeaderboardRow } from '@/components/app/pageReferrals/common/leaderboard/row'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

// Base component for manual composition
export function AdvocatesLeaderboardBase({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 md:space-y-4">{children}</div>
}

AdvocatesLeaderboardBase.Heading = LeaderboardHeading
AdvocatesLeaderboardBase.Row = LeaderboardRow

// High-level component with built-in logic
interface AdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
  countryCode: SupportedCountryCodes
  title: string
  formatLabel: (entry: DistrictRankingEntryWithRank) => string
}

export function AdvocatesLeaderboard({
  data,
  countryCode,
  title,
  formatLabel,
}: AdvocatesLeaderboardProps) {
  return (
    <AdvocatesLeaderboardBase>
      <AdvocatesLeaderboardBase.Heading>
        <AdvocatesLeaderboardBase.Heading.Title>{title}</AdvocatesLeaderboardBase.Heading.Title>
        <AdvocatesLeaderboardBase.Heading.Subtitle>
          Advocates
        </AdvocatesLeaderboardBase.Heading.Subtitle>
      </AdvocatesLeaderboardBase.Heading>
      {data.map(entry => (
        <AdvocatesLeaderboardBase.Row
          count={entry.count}
          key={`${entry.state}-${entry.district}`}
          locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          rank={entry.rank}
        >
          <AdvocatesLeaderboardBase.Row.Label>
            {formatLabel(entry)}
          </AdvocatesLeaderboardBase.Row.Label>
        </AdvocatesLeaderboardBase.Row>
      ))}
    </AdvocatesLeaderboardBase>
  )
}
