import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/pageLocalPolicy/common/statePage/recentActivitySection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const RECENT_ACTIVITY_TITLE = 'Recent activity'
const RECENT_ACTIVITY_BUTTON_LABEL = 'View all'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

const ITEMS_PER_PAGE = 5

interface UsRecentActivitySectionProps {
  stateCode: string
  stateName: string
}

export async function UsRecentActivitySection({
  stateCode,
  stateName,
}: UsRecentActivitySectionProps) {
  const { count, data: publicRecentActivity } = await getPublicRecentActivity({
    countryCode,
    limit: ITEMS_PER_PAGE,
    offset: 0,
    stateCode,
  })

  return (
    <Section>
      <Section.Title>{RECENT_ACTIVITY_TITLE}</Section.Title>
      <Section.SubTitle>{`See what actions people in ${stateName} are taking`}</Section.SubTitle>

      <RecentActivity>
        <RecentActivity.Content
          countryCode={countryCode}
          publicRecentActivity={publicRecentActivity}
        />

        {count > ITEMS_PER_PAGE && (
          <RecentActivity.Button
            href={urls.leaderboard({
              stateCode,
              tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
            })}
          >
            {RECENT_ACTIVITY_BUTTON_LABEL}
          </RecentActivity.Button>
        )}
      </RecentActivity>
    </Section>
  )
}
