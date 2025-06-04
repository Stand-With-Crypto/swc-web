import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'

export function RecentActivityList({ actions }: { actions: PublicRecentActivity }) {
  return <RecentActivityRowAnimatedContainer actions={actions.data} />
}
