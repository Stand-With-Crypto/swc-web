'use client'
import { PAGE_LEADERBOARD_ITEMS_PER_PAGE } from '@/components/app/pageLeaderboard/constants'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'

export function DynamicRecentActivity(props: { actions: PublicRecentActivity }) {
  const actions = useApiRecentActivity(props.actions, {
    limit: PAGE_LEADERBOARD_ITEMS_PER_PAGE,
  }).data
  return (
    <div>
      <div className="mt-2 h-7" />
      <RecentActivityRowAnimatedContainer actions={actions} />
    </div>
  )
}
