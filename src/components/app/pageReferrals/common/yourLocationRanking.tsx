import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { LeaderboardRow } from '@/components/app/pageReferrals/common/leaderboard/row'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { isNil } from 'lodash-es'

interface YourLocationRankingProps {
  locationRanking: GetDistrictRankResponse | null
  countryCode: SupportedCountryCodes
  heading: React.ReactNode
  label: string
}

export function YourLocationRanking(props: YourLocationRankingProps) {
  const { locationRanking, countryCode, heading, label } = props

  const count = locationRanking?.score
  const rank = locationRanking?.rank

  if (isNil(count) || isNil(rank)) {
    return null
  }

  return (
    <YourLocale>
      {heading}
      <LeaderboardRow
        count={count}
        locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
        rank={rank}
        variant="highlight"
      >
        <LeaderboardRow.Label>{label}</LeaderboardRow.Label>
      </LeaderboardRow>
    </YourLocale>
  )
}
