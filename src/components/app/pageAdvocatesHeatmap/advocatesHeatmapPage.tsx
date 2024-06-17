'use client'

import React from 'react'

import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { PageAdvocatesHeatmapProps } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.types'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function AdvocatesHeatmapPage({
  title,
  description,
  locale,
  topStatesLimit = 5,
  homepageData,
  advocatesMapPageData,
}: PageAdvocatesHeatmapProps) {
  return (
    <div className="standard-spacing-from-navbar container bg-black">
      <section className="space-y-9">
        <div className="flex w-full flex-col items-center justify-center gap-24">
          {title && description ? (
            <div className="flex flex-col gap-4">
              <PageTitle>{title}</PageTitle>
              <PageSubTitle>{description}</PageSubTitle>
            </div>
          ) : null}
        </div>
        <AdvocatesHeatmap
          advocatesMapPageData={advocatesMapPageData}
          homepageData={homepageData}
          locale={locale}
          topStatesLimit={topStatesLimit}
        />
      </section>
    </div>
  )
}
