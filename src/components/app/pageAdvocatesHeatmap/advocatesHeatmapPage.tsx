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
  isEmbedded,
}: PageAdvocatesHeatmapProps) {
  return (
    <div className="mx-auto h-screen w-full max-w-screen-xl">
      <section className={`${isEmbedded ? 'flex h-screen flex-col justify-center' : 'space-y-9'}`}>
        {title && description ? (
          <div className="flex w-full flex-col items-center justify-center gap-24">
            <div className={`flex flex-col gap-4 ${isEmbedded ? 'text-white' : 'text-black'})`}>
              <PageTitle>{title}</PageTitle>
              <PageSubTitle>{description}</PageSubTitle>
            </div>
          </div>
        ) : null}
        <AdvocatesHeatmap
          advocatesMapPageData={advocatesMapPageData}
          homepageData={homepageData}
          isEmbedded={isEmbedded}
          locale={locale}
          topStatesLimit={topStatesLimit}
        />
      </section>
    </div>
  )
}