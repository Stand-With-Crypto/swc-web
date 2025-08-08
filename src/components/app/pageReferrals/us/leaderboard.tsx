import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface USAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.US as const

export function USAdvocatesLeaderboard(props: USAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard
      countryCode={countryCode}
      data={data}
      formatLabel={entry =>
        `${getUSStateNameFromStateCode(entry.state)} - District ${entry.district}`
      }
      title="Top districts"
    />
  )
}
