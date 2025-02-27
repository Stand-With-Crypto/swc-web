'use client'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function DynamicRecentActivity(props: {
  actions: PublicRecentActivity
  countryCode: SupportedCountryCodes
}) {
  const { itemsPerPage } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]

  const actions = useApiRecentActivity(props.actions, {
    limit: itemsPerPage,
    countryCode: props.countryCode,
  }).data
  return <RecentActivityRowAnimatedContainer actions={actions} />
}
