'use client'

import { useRef } from 'react'
import { TabsContent } from '@radix-ui/react-tabs'
import { useInView } from 'motion/react'

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
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export function DelayedRecentActivityWithMap(props: {
  actions: PublicRecentActivity
  countUsers: number
  countryCode: SupportedCountryCodes
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
}) {
  const recentActivity = useApiRecentActivity(props.actions, { limit: 30, restrictToUS: true })
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = recentActivity.data.slice(isInView ? 0 : 1, recentActivity.data.length)
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
    <ErrorBoundary
      extras={{
        mapProps: {
          countUsers: props.countUsers,
          locale: props.countryCode,
          advocatesMapPageData: props.advocatesMapPageData,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'DelayedRecentActivityWithMap',
      }}
    >
      <AdvocatesHeatmap
        actions={recentActivity.data}
        advocatesMapPageData={props.advocatesMapPageData}
        countUsers={props.countUsers}
        countryCode={props.countryCode}
        isEmbedded={false}
      />
    </ErrorBoundary>
  )
}
