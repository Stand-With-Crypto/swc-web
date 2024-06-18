'use client'

import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapOdometer'
import { TotalAdvocatesPerStateTooltip } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapTooltip'
import {
  ADVOCATES_ACTIONS,
  ADVOCATES_HEATMAP_GEO_URL,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import {
  createMarkersFromActions,
  MapMarker,
} from '@/components/app/pageAdvocatesHeatmap/createMapMarkers'
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
  topStatesLimit?: number
}

const MapComponent = ({
  markers,
  handleStateMouseHover,
  handleStateMouseOut,
}: {
  markers: MapMarker[]
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
}) => (
  <ComposableMap projection="geoAlbersUsa">
    <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
      {({ geographies }) => (
        <>
          {geographies.map(geo => (
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
          ))}
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
      )}
    </Geographies>
  </ComposableMap>
)

const ActionsList = () => {
  return (
    <div className="flex w-full flex-row justify-around gap-3 md:w-auto md:flex-col md:justify-between">
      {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
        const ActionIcon = action.icon

        return (
          <div
            className="flex flex-col items-center gap-3 font-sans text-base text-black md:flex-row"
            key={key}
          >
            <ActionIcon className="w-8 md:w-10" />
            <span className="text-nowrap text-xs text-white">{action.label}</span>
          </div>
        )
      })}
    </div>
  )
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

  return (
    <div className="flex flex-col items-start p-2">
      <div className="flex w-full flex-col items-start gap-4 md:flex-row">
        <ActionsList />
        <MapComponent
          handleStateMouseHover={handleStateMouseHover}
          handleStateMouseOut={handleStateMouseOut}
          markers={markers}
        />
        <TotalAdvocatesPerStateTooltip
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          hoveredStateName={hoveredStateName}
          locale={locale}
          mousePosition={mousePosition}
        />
      </div>
      <div className="mt-2 flex w-full items-center justify-end">
        <AdvocateHeatmapOdometer
          className="bg-black font-sans text-white"
          homepageData={homepageData}
          locale={locale}
        />
      </div>
    </div>
  )
}
