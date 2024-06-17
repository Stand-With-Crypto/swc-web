'use client'

import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapOdometer'
import { TotalAdvocatesPerStateTooltip } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapTooltip'
import {
  ADVOCATES_ACTIONS,
  ADVOCATES_HEATMAP_GEO_URL,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { createMarkersFromActions } from '@/components/app/pageAdvocatesHeatmap/createMapMarkers'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { SupportedLocale } from '@/intl/locales'
import { getUSStateCodeFromStateName } from '@/utils/shared/usStateUtils'

interface RenderMapProps {
  locale: SupportedLocale
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  topStatesLimit?: number | undefined
}

export function AdvocatesHeatmap({
  locale,
  homepageData,
  advocatesMapPageData,
  topStatesLimit = 5,
}: RenderMapProps) {
  const actions = useApiRecentActivity(homepageData.actions, { limit: 10 })
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData, {
    topStatesLimit,
  })

  const markers = useMemo(() => createMarkersFromActions(actions.data), [actions.data])

  const totalAdvocatesPerState = advocatesPerState.data.advocatesMapData.totalAdvocatesPerState

  const getTotalAdvocatesPerState = useCallback(
    (stateName: string) => {
      const stateCode = getUSStateCodeFromStateName(stateName)
      return totalAdvocatesPerState.find(total => total.state === stateCode)?.totalAdvocates
    },
    [totalAdvocatesPerState],
  )

  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const handleStateMouseHover = useCallback((geo: any, event: MouseEvent<SVGPathElement>) => {
    const { clientX, clientY } = event

    setMousePosition({ x: clientX, y: clientY })
    setHoveredStateName(geo.properties.name)
  }, [])

  const handleStateMouseOut = useCallback(() => {
    setHoveredStateName(null)
  }, [])

  return markers.length === 0 ? null : (
    <div className="flex flex-col items-start p-2">
      <div className="flex w-full items-start">
        <div className="pointer-events-none relative z-50 flex flex-shrink-0 flex-col items-start justify-start gap-3">
          {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
            const ActionIcon = action.icon
            return (
              <div
                className="flex items-center justify-center gap-3 font-sans text-base text-black"
                key={key}
              >
                <ActionIcon />
                <span className="text-sm text-white">{action.label.toLocaleLowerCase()}</span>
              </div>
            )
          })}
        </div>
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
            {({ geographies }) => {
              return (
                <>
                  {geographies.map(geo => {
                    return (
                      <Geography
                        cursor="pointer"
                        geography={geo}
                        key={geo.rsmKey}
                        onMouseMove={event => handleStateMouseHover(geo, event)}
                        onMouseOut={handleStateMouseOut}
                        stroke="#FFF"
                        style={{
                          default: {
                            fill: '#171717',
                            stroke: '#3A3B3D',
                            strokeWidth: '0.971px',
                            outline: 'none',
                            transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                          },
                          hover: {
                            fill: '#6100FF',
                            outline: 'none',
                            stroke: '#3A3B3D',
                            strokeWidth: '0.971px',
                          },
                          pressed: {
                            fill: '#6100FF',
                            outline: 'none',
                            stroke: '#3A3B3D',
                            strokeWidth: '0.971px',
                          },
                        }}
                      />
                    )
                  })}
                  {markers.map(({ name, coordinates, actionType }) => {
                    const currentIconActionType =
                      ADVOCATES_ACTIONS[actionType as keyof typeof ADVOCATES_ACTIONS]

                    if (!currentIconActionType) {
                      return null
                    }

                    const IconComponent = currentIconActionType.icon

                    return (
                      <Marker
                        coordinates={coordinates}
                        key={name}
                        style={{
                          default: {
                            pointerEvents: 'none',
                          },
                        }}
                      >
                        <IconComponent isPulsing={true} />
                      </Marker>
                    )
                  })}
                </>
              )
            }}
          </Geographies>
        </ComposableMap>
        <TotalAdvocatesPerStateTooltip
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          hoveredStateName={hoveredStateName}
          locale={locale}
          mousePosition={mousePosition}
        />
      </div>
      <div className="flex w-full items-center justify-end">
        <AdvocateHeatmapOdometer
          className="bg-black text-white"
          homepageData={homepageData}
          locale={locale}
        />
      </div>
    </div>
  )
}
