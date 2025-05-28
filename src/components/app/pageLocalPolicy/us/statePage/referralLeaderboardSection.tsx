import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { ReferralLeaderboard } from '@/components/app/pageLocalPolicy/common/statePage/referralLeaderboardSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { IntlUrls } from '@/components/app/pageLocalPolicy/common/types'
import { getDistrictsLeaderboardDataByState } from '@/utils/server/districtRankings/upsertRankings'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SECTION_TITLE = 'Referral leaderboard'
const SECTION_BUTTON_LABEL = 'View all'

interface UsReferralLeaderboardSectionProps {
  countryCode: SupportedCountryCodes
  stateCode: string
  stateName: string
  urls: IntlUrls
}

const itemsPerPage = 5

export async function UsReferralLeaderboardSection({
  countryCode,
  stateCode,
  stateName,
  urls,
}: UsReferralLeaderboardSectionProps) {
  const sectionSubTitle = `See which districts in ${stateName} have the most advocates`

  const { items: leaderboardData, total } = await getDistrictsLeaderboardDataByState({
    limit: itemsPerPage,
    offset: 0,
    stateCode: stateCode.toUpperCase(),
  })

  return (
    <Section>
      <Section.Title>{SECTION_TITLE}</Section.Title>
      <Section.SubTitle>{sectionSubTitle}</Section.SubTitle>

      <ReferralLeaderboard>
        <ReferralLeaderboard.Content countryCode={countryCode} data={leaderboardData} />

        {total > itemsPerPage && (
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
