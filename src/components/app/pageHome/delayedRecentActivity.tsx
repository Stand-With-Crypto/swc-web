'use client'
import { useRef } from 'react'
import { TabsContent } from '@radix-ui/react-tabs'
import { useInView } from 'framer-motion'

import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { RecentActivityRowAnimatedContainer } from '@/components/app/recentActivityRow/recentActivityRowAnimatedContainer'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'

export function DelayedRecentActivityWithMap(props: {
  actions: PublicRecentActivity
  countUsers: number
  locale: SupportedLocale
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
}) {
  const actions = useApiRecentActivity(props.actions, { limit: 20 }).data
  const ref = useRef(null)
  const isInVew = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = actions.slice(isInVew ? 0 : 1, actions.length)
  const urls = useIntlUrls()
  const isMobile = useIsMobile()

  return isMobile ? (
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
  ) : (
    <AdvocatesHeatmap
      actions={actions}
      advocatesMapPageData={props.advocatesMapPageData}
      countUsers={props.countUsers}
      isEmbedded={false}
      locale={props.locale}
    />
  )
}
