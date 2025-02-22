import { DistrictsLeaderboardRow } from '@/components/app/pageReferrals/districtsLeaderboardRow'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface DistrictsLeaderboardProps {
  data: DistrictRankingEntryWithRank[]
  countryCode: SupportedCountryCodes
}

export function DistrictsLeaderboard(props: DistrictsLeaderboardProps) {
  const { data, countryCode } = props

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <p className="pl-4 text-lg font-bold">Top district</p>
        <p className="text-fontcolor-muted">Advocates</p>
      </div>

      {data.map(({ state, district, count, rank }) => (
        <DistrictsLeaderboardRow
          count={count}
          district={district}
          key={`${state}-${district}`}
          locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          rank={rank}
          state={state}
        />
      ))}
    </div>
  )
}
