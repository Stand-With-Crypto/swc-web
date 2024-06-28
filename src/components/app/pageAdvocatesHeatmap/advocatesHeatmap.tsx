'use client'

import { MouseEvent, useCallback, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { AnimatePresence } from 'framer-motion'

import { AdvocateHeatmapActionList } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionList'
import { ActionInfoTooltip } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionTooltip'
import { AdvocateHeatmapMarker } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapMarker'
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
import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
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
  isEmbedded?: boolean
}

const MapComponent = ({
  markers,
  handleStateMouseHover,
  handleStateMouseOut,
  locale,
  isEmbedded,
}: {
  markers: MapMarker[]
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  locale: SupportedLocale
  isEmbedded?: boolean
}) => {
  const [actionInfo, setActionInfo] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const currentFill = isEmbedded ? '#171717' : '#F6F1FF'
  const currentStroke = isEmbedded ? '#3A3B3D' : '#D7BFFF'
  const currentHoverAndPressedFill = isEmbedded ? '#6100FF' : '#DDC9FF'

  const handleActionMouseOver = useCallback(
    (currentActionInfo: string, event: MouseEvent<SVGElement>) => {
      event.stopPropagation()

      const actionBoundingClientRect = event.currentTarget.getBoundingClientRect()
      const actionPosition = {
        x: actionBoundingClientRect.left + actionBoundingClientRect.width / 2,
        y: actionBoundingClientRect.top + actionBoundingClientRect.height / 2,
      }

      setActionInfo(currentActionInfo)
      setMousePosition(actionPosition)
    },
    [],
  )

  const handleActionMouseLeave = useCallback((event?: MouseEvent<SVGElement>) => {
    event?.stopPropagation()
    setMousePosition(null)
    setActionInfo(null)
  }, [])

  return (
    <>
      <ComposableMap projection="geoAlbersUsa" viewBox="0 50 800 500">
        <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => (
                <Geography
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
              <AnimatePresence>
                {markers.map(({ name, coordinates, actionType, datetimeCreated }) => {
                  const currentIconActionType =
                    ADVOCATES_ACTIONS[actionType as keyof typeof ADVOCATES_ACTIONS]

                  if (!currentIconActionType) {
                    return null
                  }

                  const creationTime = FormattedRelativeDatetime({
                    date: new Date(datetimeCreated),
                    locale,
                  })

                  const currentActionInfo = `${currentIconActionType.labelActionTooltip} in ${name} ${creationTime.toLowerCase()}`
                  const IconComponent = currentIconActionType.icon

                  return (
                    <AdvocateHeatmapMarker
                      IconComponent={IconComponent}
                      coordinates={coordinates}
                      currentActionInfo={currentActionInfo}
                      handleActionMouseLeave={handleActionMouseLeave}
                      handleActionMouseOver={handleActionMouseOver}
                      key={`${name}-${datetimeCreated}-${coordinates.toString()}`}
                    />
                  )
                })}
              </AnimatePresence>
            </>
          )}
        </Geographies>
      </ComposableMap>
      <ActionInfoTooltip
        actionInfo={actionInfo}
        handleClearPressedState={handleActionMouseLeave}
        mousePosition={mousePosition}
      />
    </>
  )
}

export function AdvocatesHeatmap({
  locale,
  homepageData,
  advocatesMapPageData,
  isEmbedded,
}: RenderMapProps) {
  const actions = useApiRecentActivity(homepageData.actions, { limit: 20 })
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData)

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

  const handleClearPressedState = () => {
    setMousePosition(null)
    setHoveredStateName(null)
  }

  return (
    <div className="flex flex-col items-start px-2 py-6">
      <div className="flex w-full flex-col items-start gap-4 md:flex-row">
        <AdvocateHeatmapActionList isEmbedded={isEmbedded} />
        <MapComponent
          handleStateMouseHover={handleStateMouseHover}
          handleStateMouseOut={handleStateMouseOut}
          isEmbedded={isEmbedded}
          locale={locale}
          markers={markers}
        />
        <TotalAdvocatesPerStateTooltip
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          handleClearPressedState={handleClearPressedState}
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
