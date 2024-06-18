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
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'
import { getUSStateCodeFromStateName } from '@/utils/shared/usStateUtils'

interface RenderMapProps {
  locale: SupportedLocale
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  topStatesLimit?: number
  isEmbedded?: boolean
}

const MapComponent = ({
  markers,
  handleStateMouseHover,
  handleStateMouseOut,
  isEmbedded,
}: {
  markers: MapMarker[]
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  isEmbedded?: boolean
}) => {
  const currentFill = isEmbedded ? '#171717' : '#F6F1FF'
  const currentStroke = isEmbedded ? '#3A3B3D' : '#D7BFFF'
  const currentHoverAndPressedFill = isEmbedded ? '#6100FF' : '#DDC9FF'

  return (
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
                    fill: currentFill,
                    stroke: currentStroke,
                    strokeWidth: '0.971px',
                    outline: 'none',
                    transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                  },
                  hover: {
                    fill: currentHoverAndPressedFill,
                    outline: 'none',
                    stroke: currentStroke,
                    strokeWidth: '0.971px',
                  },
                  pressed: {
                    fill: currentHoverAndPressedFill,
                    outline: 'none',
                    stroke: currentStroke,
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
}

const ActionsList = ({ isEmbedded }: { isEmbedded?: boolean }) => {
  const isMobile = useIsMobile()

  return (
    <div className="flex w-full flex-row justify-around gap-3 md:w-auto md:flex-col md:justify-between">
      {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
        const ActionIcon = action.icon

        return (
          <div
            className={`flex flex-col items-center gap-3 font-sans text-base md:flex-row ${isEmbedded ? 'text-white' : 'text-black'}`}
            key={key}
          >
            <ActionIcon className="w-8 md:w-10" />
            <span className="text-nowrap text-xs">
              {isMobile ? action.labelMobile : action.label}
            </span>
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
  isEmbedded,
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
        <ActionsList isEmbedded={isEmbedded} />
        <MapComponent
          handleStateMouseHover={handleStateMouseHover}
          handleStateMouseOut={handleStateMouseOut}
          isEmbedded={isEmbedded}
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
          className={`font-sans ${isEmbedded ? 'bg-black text-white' : 'bg-inherit text-black'}`}
          homepageData={homepageData}
          locale={locale}
        />
      </div>
    </div>
  )
}
