import { ReferralLeaderboardRow } from '@/components/app/pageReferrals/referralLeaderboardRow'
import { DistrictRankingEntry } from '@/utils/server/districtRankings/upsertRankings'

interface ReferralLeaderboardProps {
  districtRankings: DistrictRankingEntry[]
}

export function ReferralLeaderboard(props: ReferralLeaderboardProps) {
  const { districtRankings } = props

  return (
    <div className="space-y-3">
      <p className="pl-4 text-lg font-bold">Top district</p>

      {districtRankings.map(({ state, district, count }, index) => (
        <ReferralLeaderboardRow
          count={count}
          district={district}
          key={`${state}-${district}`}
          rank={index + 1}
          state={state}
        />
      ))}
    </div>
  )
}
