import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/pageLocalPolicy/common/statePage/recentActivitySection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { IntlUrls } from '@/components/app/pageLocalPolicy/common/types'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const itemsPerPage = 5

const RECENT_ACTIVITY_TITLE = 'Recent activity'

interface UsRecentActivitySectionProps {
  countryCode: SupportedCountryCodes
  stateCode: string
  stateName: string
  urls: IntlUrls
}

export async function UsRecentActivitySection({
  countryCode,
  stateCode,
  stateName,
  urls,
}: UsRecentActivitySectionProps) {
  const RECENT_ACTIVITY_SUBTITLE = `See what actions people in ${stateName} are taking`

  const { count, data: publicRecentActivity } = await getPublicRecentActivity({
    countryCode,
    limit: itemsPerPage,
    offset: 0,
    stateCode,
  })

  return (
    <Section>
      <Section.Title>{RECENT_ACTIVITY_TITLE}</Section.Title>
      <Section.SubTitle>{RECENT_ACTIVITY_SUBTITLE}</Section.SubTitle>

      <RecentActivity>
        <RecentActivity.Content
          countryCode={countryCode}
          publicRecentActivity={publicRecentActivity}
        />

        {count > itemsPerPage && (
          <RecentActivity.Button
            href={urls.leaderboard({
              tab: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
              stateCode,
            })}
          >
            View all
          </RecentActivity.Button>
        )}
      </RecentActivity>
    </Section>
  )
}
