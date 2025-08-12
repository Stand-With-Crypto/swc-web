import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface AuAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.AU as const

export function AuAdvocatesLeaderboard(props: AuAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard
      countryCode={countryCode}
      data={data}
      formatLabel={entry => `${getAUStateNameFromStateCode(entry.state)} - ${entry.district}`}
      title="Top divisions"
    />
  )
}
