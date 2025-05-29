import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { ReferralLeaderboard } from '@/components/app/pageLocalPolicy/common/statePage/referralLeaderboardSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { getDistrictsLeaderboardDataByState } from '@/utils/server/districtRankings/upsertRankings'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const SECTION_TITLE = 'Referral leaderboard'
const SECTION_BUTTON_LABEL = 'View all'

const ITEMS_PER_PAGE = 5

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsReferralLeaderboardSectionProps {
  stateCode: string
  stateName: string
}

export async function UsReferralLeaderboardSection({
  stateCode,
  stateName,
}: UsReferralLeaderboardSectionProps) {
  const { items: leaderboardData, total } = await getDistrictsLeaderboardDataByState({
    limit: ITEMS_PER_PAGE,
    offset: 0,
    stateCode: stateCode.toUpperCase(),
  })

  return (
    <Section>
      <Section.Title>{SECTION_TITLE}</Section.Title>
      <Section.SubTitle>{`See which districts in ${stateName} have the most advocates`}</Section.SubTitle>

      <ReferralLeaderboard>
        <ReferralLeaderboard.Content countryCode={countryCode} data={leaderboardData} />

        {total > ITEMS_PER_PAGE && (
          <ReferralLeaderboard.Button
            href={urls.leaderboard({
              stateCode,
              tab: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
            })}
          >
            {SECTION_BUTTON_LABEL}
          </ReferralLeaderboard.Button>
        )}
      </ReferralLeaderboard>
    </Section>
  )
}
