'use client'
import { useRef } from 'react'
import { TabsContent } from '@radix-ui/react-tabs'
import { useInView } from 'framer-motion'

import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function DelayedRecentActivity({ actions }: { actions: PublicRecentActivity }) {
  const ref = useRef(null)
  const isInVew = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = actions.slice(isInVew ? 0 : 1, actions.length)
  const urls = useIntlUrls()
  return (
    <TabsContent ref={ref} value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
      <RecentActivityRowAnimatedContainer actions={visibleActions} />
      <div className="mt-7 space-x-4 text-center">
        <Button asChild>
          <InternalLink href={urls.donate()}>Donate</InternalLink>
        </Button>
        <Button asChild variant="secondary">
          <InternalLink href={urls.leaderboard()}>View all</InternalLink>
        </Button>
      </div>
    </TabsContent>
  )
}
