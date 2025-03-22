'use client'

import { useRef } from 'react'
import { TabsContent } from '@radix-ui/react-tabs'
import { useInView } from 'motion/react'

import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/recentActivity'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export function DelayedRecentActivityWithMap({
  actions,
  countUsers,
  countryCode,
  advocatesMapPageData,
}: {
  actions: PublicRecentActivity
  countUsers: number
  countryCode: SupportedCountryCodes
  advocatesMapPageData?: Awaited<ReturnType<typeof getAdvocatesMapData>>
}) {
  const recentActivity = useApiRecentActivity(actions, {
    limit: 30,
    countryCode,
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = recentActivity.data.slice(isInView ? 0 : 1, recentActivity.data.length)
  const urls = useIntlUrls()
  const isMobile = useIsMobile()

  return isMobile || !advocatesMapPageData ? (
    <TabsContent ref={ref} value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
      <RecentActivity.List actions={visibleActions} />
      <RecentActivity.Footer>
        <Button asChild>
          <InternalLink href={urls.donate()}>Donate</InternalLink>
        </Button>
        <Button asChild variant="secondary">
          <InternalLink href={urls.leaderboard()}>View all</InternalLink>
        </Button>
      </RecentActivity.Footer>
    </TabsContent>
  ) : (
    <ErrorBoundary
      extras={{
        mapProps: {
          countUsers,
          locale: countryCode,
          advocatesMapPageData,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'DelayedRecentActivityWithMap',
      }}
    >
      <AdvocatesHeatmap
        actions={recentActivity.data}
        advocatesMapPageData={advocatesMapPageData}
        countUsers={countUsers}
        countryCode={countryCode}
        isEmbedded={false}
      />
    </ErrorBoundary>
  )
}
