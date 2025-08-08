import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface CaAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.CA as const

export function CaAdvocatesLeaderboard(props: CaAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard
      countryCode={countryCode}
      data={data}
      formatLabel={entry =>
        `${getCAProvinceOrTerritoryNameFromCode(entry.state)} - ${entry.district}`
      }
      title="Top constituencies"
    />
  )
}
