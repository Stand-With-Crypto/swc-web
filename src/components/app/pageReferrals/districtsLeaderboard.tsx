import { DistrictsLeaderboardRow } from '@/components/app/pageReferrals/districtsLeaderboardRow'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'

interface DistrictsLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
}

export function DistrictsLeaderboard(props: DistrictsLeaderboardProps) {
  const { data } = props

  return (
    <div className="space-y-3 md:space-y-4">
      <p className="pl-4 text-lg font-bold">Top district</p>

      {data.map(({ state, district, count, rank }) => (
        <DistrictsLeaderboardRow
          count={count}
          district={district}
          key={`${state}-${district}`}
          rank={rank}
          state={state}
        />
      ))}
    </div>
  )
}
