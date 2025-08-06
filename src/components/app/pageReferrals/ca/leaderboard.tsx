'use client'

import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface CaAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.CA as const

export function CaAdvocatesLeaderboard(props: CaAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard>
      <AdvocatesLeaderboard.Heading>
        <AdvocatesLeaderboard.Heading.Title>Top constituencies</AdvocatesLeaderboard.Heading.Title>
        <AdvocatesLeaderboard.Heading.Subtitle>Advocates</AdvocatesLeaderboard.Heading.Subtitle>
      </AdvocatesLeaderboard.Heading>
      {data.map(entry => (
        <AdvocatesLeaderboard.Row
          count={entry.count}
          key={`${entry.state}-${entry.district}`}
          locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          rank={entry.rank}
        >
          <AdvocatesLeaderboard.Row.Label>{`${getCAProvinceOrTerritoryNameFromCode(entry.state)} - ${entry.district}`}</AdvocatesLeaderboard.Row.Label>
        </AdvocatesLeaderboard.Row>
      ))}
    </AdvocatesLeaderboard>
  )
}
