'use client'
import { useRef } from 'react'
import { TabsContent } from '@radix-ui/react-tabs'
import { useInView } from 'framer-motion'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'

export function DelayedRecentActivity(props: { actions: PublicRecentActivity }) {
  const actions = useApiRecentActivity(props.actions, { limit: 10 }).data
  const ref = useRef(null)
  const isInVew = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = actions.slice(isInVew ? 0 : 1, actions.length)
  return (
    <TabsContent ref={ref} value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
      <div className="mt-2 h-7" />
      <RecentActivityRowAnimatedContainer actions={visibleActions} />
    </TabsContent>
  )
}
