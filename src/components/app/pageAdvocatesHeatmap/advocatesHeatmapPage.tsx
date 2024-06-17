'use client'

import React, { useCallback, useMemo } from 'react'

import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapOdometer'
import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { PageAdvocatesHeatmapProps } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.types'
import {
  createMarkersFromActions,
  createMarkersFromTopAdvocateStates,
} from '@/components/app/pageAdvocatesHeatmap/createMapMarkers'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { getUSStateCodeFromStateName } from '@/utils/shared/usStateUtils'

export function AdvocatesHeatmapPage({
  title,
  description,
  locale,
  topStatesLimit = 5,
  homepageData,
  advocatesMapPageData,
}: PageAdvocatesHeatmapProps) {
  const actions = useApiRecentActivity(homepageData.actions, { limit: 10 })
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData, {
    topStatesLimit,
  })

  const markers = useMemo(() => createMarkersFromActions(actions.data), [actions.data])
  const topStateMarkers = useMemo(
    () =>
      createMarkersFromTopAdvocateStates(advocatesPerState.data.advocatesMapData.topAdvocateStates),
    [advocatesPerState.data.advocatesMapData.topAdvocateStates],
  )
  const totalAdvocatesPerState = advocatesPerState.data.advocatesMapData.totalAdvocatesPerState

  const getTotalAdvocatesPerState = useCallback(
    (stateName: string) => {
      const stateCode = getUSStateCodeFromStateName(stateName)
      return totalAdvocatesPerState.find(total => total.state === stateCode)?.totalAdvocates
    },
    [totalAdvocatesPerState],
  )

  return (
    <div className="standard-spacing-from-navbar container space-y-20">
      <section className="space-y-9">
        <div className="flex w-full flex-col items-center justify-center gap-24">
          {title && description ? (
            <div className="flex flex-col gap-4">
              <PageTitle>{title}</PageTitle>
              <PageSubTitle>{description}</PageSubTitle>
            </div>
          ) : null}
          <AdvocateHeatmapOdometer homepageData={homepageData} locale={locale} />
        </div>
        <AdvocatesHeatmap
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          locale={locale}
          markers={markers}
          topStateMarkers={topStateMarkers}
        />
      </section>
    </div>
  )
}
