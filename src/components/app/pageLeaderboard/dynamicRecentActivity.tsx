'use client'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { getCountryCodeOnClient } from '@/utils/web/getCountryCodeOnClient'

export function DynamicRecentActivity(props: { actions: PublicRecentActivity }) {
  const { itemsPerPage } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY]
  const countryCode = getCountryCodeOnClient()
  const actions = useApiRecentActivity(props.actions, {
    limit: itemsPerPage,
    countryCode,
  }).data
  return <RecentActivityRowAnimatedContainer actions={actions} />
}
