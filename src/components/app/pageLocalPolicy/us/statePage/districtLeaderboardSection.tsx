import { DistrictLeaderboard } from '@/components/app/pageLocalPolicy/common/statePage/districtLeaderboardSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { getDistrictsLeaderboardDataByState } from '@/utils/server/districtRankings/upsertRankings'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const ITEMS_PER_PAGE = 5

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsDistrictLeaderboardSectionProps {
  stateCode: string
  stateName: string
}

export async function UsDistrictLeaderboardSection({
  stateCode,
  stateName,
}: UsDistrictLeaderboardSectionProps) {
  const { items: leaderboardData, total } = await getDistrictsLeaderboardDataByState(
    SupportedCountryCodes.US,
    stateCode.toUpperCase(),
    {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
  )

  return (
    total > 1 && (
      <Section>
        <Section.Title>District leaderboard</Section.Title>
        <Section.SubTitle>
          See which districts in {stateName} have the most advocates
        </Section.SubTitle>

        <DistrictLeaderboard>
          <DistrictLeaderboard.Content countryCode={countryCode} data={leaderboardData} />

          {total > ITEMS_PER_PAGE && (
            <DistrictLeaderboard.Button
              href={urls.referrals({
                stateCode,
              })}
            >
              View all
            </DistrictLeaderboard.Button>
          )}
        </DistrictLeaderboard>
      </Section>
    )
  )
}
