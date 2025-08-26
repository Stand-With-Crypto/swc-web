import { AdvocatesLeaderboard } from '@/components/app/pageReferrals/common/leaderboard'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface GbAdvocatesLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

const countryCode = SupportedCountryCodes.GB as const

export function GbAdvocatesLeaderboard(props: GbAdvocatesLeaderboardProps) {
  const { data } = props

  return (
    <AdvocatesLeaderboard
      countryCode={countryCode}
      data={data}
      formatLabel={entry => `${entry.state} - ${entry.district}`}
      title="Top constituencies"
    />
  )
}
