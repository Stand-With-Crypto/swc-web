import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { notFound } from 'next/navigation'

import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { PageAdvocatesHeatmapProps } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.types'
import { MAP_PROJECTION_CONFIG } from '@/components/app/pageAdvocatesHeatmap/constants'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function AdvocatesHeatmapPage({
  title,
  description,
  countryCode,
  actions,
  countUsers,
  advocatesMapPageData,
  isEmbedded,
}: PageAdvocatesHeatmapProps) {
  const mapConfig = MAP_PROJECTION_CONFIG[countryCode]

  if (!mapConfig) {
    Sentry.captureMessage(`Map config not found for country code: ${countryCode}`, {
      level: 'error',
      extra: {
        countryCode,
      },
    })
    return notFound()
  }

  return (
    <div
      className={cn('mx-auto flex w-full max-w-screen-xl flex-col justify-center', {
        'min-h-screen overflow-hidden': isEmbedded,
      })}
    >
      <section className={'standard-spacing-from-navbar flex flex-col justify-center space-y-9'}>
        {title && description ? (
          <div className="flex w-full flex-col items-center justify-center gap-24">
            <div className={`flex flex-col gap-4 ${isEmbedded ? 'text-white' : 'text-black'})`}>
              <PageTitle>{title}</PageTitle>
              <PageSubTitle>{description}</PageSubTitle>
            </div>
          </div>
        ) : null}
        <AdvocatesHeatmap
          actions={actions}
          advocatesMapPageData={advocatesMapPageData}
          countUsers={countUsers?.total ?? 0}
          countryCode={countryCode}
          isEmbedded={isEmbedded}
          mapConfig={mapConfig}
        />
      </section>
    </div>
  )
}
