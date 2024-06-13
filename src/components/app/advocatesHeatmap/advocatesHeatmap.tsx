'use client'

import React, { useCallback, useMemo } from 'react'

import { AdvocateHeatmapCounter } from '@/components/app/advocatesHeatmap/advocateHeatmapCounter'
import { PageAdvocatesHeatmapProps } from '@/components/app/advocatesHeatmap/advocatesHeatmap.types'
import {
  createMarkersFromActions,
  createMarkersFromTopAdvocateStates,
} from '@/components/app/advocatesHeatmap/createMapMarkers'
import { RenderMap } from '@/components/app/advocatesHeatmap/renderMap'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { getUSStateCodeFromStateName } from '@/utils/shared/usStateUtils'

export function AdvocatesHeatmap({
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
  const totalAdvocatesPerState = useMemo(
    () => advocatesPerState.data.advocatesMapData.totalAdvocatesPerState,
    [advocatesPerState.data.advocatesMapData],
  )

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
          <AdvocateHeatmapCounter homepageData={homepageData} locale={locale} />
        </div>
        <RenderMap
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          locale={locale}
          markers={markers}
          topStateMarkers={topStateMarkers}
        />
      </section>
    </div>
  )
}
