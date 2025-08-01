'use client'

import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface USAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.US as const

export function USAdvocatesLeaderboard(props: USAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard>
      <AdvocatesLeaderboard.Heading>
        <AdvocatesLeaderboard.Heading.Title>Top districts</AdvocatesLeaderboard.Heading.Title>
        <AdvocatesLeaderboard.Heading.Subtitle>Advocates</AdvocatesLeaderboard.Heading.Subtitle>
      </AdvocatesLeaderboard.Heading>
      {data.map(entry => (
        <AdvocatesLeaderboard.Row
          count={entry.count}
          key={`${entry.state}-${entry.district}`}
          locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          rank={entry.rank}
        >
          <AdvocatesLeaderboard.Row.Label>{`${getUSStateNameFromStateCode(entry.state)} - District ${entry.district}`}</AdvocatesLeaderboard.Row.Label>
        </AdvocatesLeaderboard.Row>
      ))}
    </AdvocatesLeaderboard>
  )
}
