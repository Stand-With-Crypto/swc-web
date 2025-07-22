import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface AuAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const COUNTRY_CODE = SupportedCountryCodes.AU as const

export function AuAdvocatesLeaderboard(props: AuAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard>
      <AdvocatesLeaderboard.Heading>
        <AdvocatesLeaderboard.Heading.Title>Top divisions</AdvocatesLeaderboard.Heading.Title>
        <AdvocatesLeaderboard.Heading.Subtitle>Advocates</AdvocatesLeaderboard.Heading.Subtitle>
      </AdvocatesLeaderboard.Heading>
      {data.map(entry => (
        <AdvocatesLeaderboard.Row
          count={entry.count}
          key={`${entry.state}-${entry.district}`}
          locale={COUNTRY_CODE_TO_LOCALE[COUNTRY_CODE]}
          rank={entry.rank}
        >
          <AdvocatesLeaderboard.Row.Label>{`${getAUStateNameFromStateCode(entry.state)} - ${entry.district}`}</AdvocatesLeaderboard.Row.Label>
        </AdvocatesLeaderboard.Row>
      ))}
    </AdvocatesLeaderboard>
  )
}
