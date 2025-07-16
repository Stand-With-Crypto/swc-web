'use client'

import { useRef } from 'react'
import { useInView } from 'motion/react'

import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { MAP_PROJECTION_CONFIG } from '@/components/app/pageAdvocatesHeatmap/constants'
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
  showDonateButton = true,
}: {
  actions: PublicRecentActivity
  countUsers: number
  countryCode: SupportedCountryCodes
  advocatesMapPageData?: Awaited<ReturnType<typeof getAdvocatesMapData>>
  showDonateButton?: boolean
}) {
  const { data: recentActivity } = useApiRecentActivity(actions, {
    limit: 30,
    countryCode,
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-50%', once: true })
  const visibleActions = recentActivity.data.slice(isInView ? 0 : 1, recentActivity.data.length)
  const urls = useIntlUrls()
  const isMobile = useIsMobile()

  const mapConfig = MAP_PROJECTION_CONFIG[countryCode]

  return isMobile || !advocatesMapPageData || !mapConfig ? (
    <div>
      <RecentActivity.List
        actions={{
          data: visibleActions,
          count: recentActivity.count,
        }}
      />
      <RecentActivity.Footer>
        {showDonateButton && (
          <Button asChild>
            <InternalLink href={urls.donate()}>Donate</InternalLink>
          </Button>
        )}
        <Button asChild variant="secondary">
          <InternalLink href={urls.community()}>View all</InternalLink>
        </Button>
      </RecentActivity.Footer>
    </div>
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
        actions={recentActivity}
        advocatesMapPageData={advocatesMapPageData}
        countUsers={countUsers}
        countryCode={countryCode}
        isEmbedded={false}
        mapConfig={mapConfig}
      />
    </ErrorBoundary>
  )
}
