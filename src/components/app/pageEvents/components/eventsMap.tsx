'use client'

import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { AnimatePresence, motion } from 'motion/react'

import { ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/pageAdvocatesHeatmap/constants'
import {
  StateEventsDialog,
  StateEventsDialogProps,
} from '@/components/app/pageEvents/components/stateEventsDialog'
import { EVENT_MAP_STATE_COORDS } from '@/components/app/pageEvents/utils/mapCoordinates'
import { pluralize } from '@/utils/shared/pluralize'
import {
  getUSStateCodeFromStateName,
  getUSStateNameFromStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

interface MapMarker {
  id: string
  name: string
  coordinates: [number, number]
  eventsInStateMarker: number
  eventState: string
}

export function EventsMap({ events }: { events: SWCEvents }) {
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [stateDialogProps, setStateDialogProps] = useState<
    Omit<StateEventsDialogProps, 'setIsOpen'>
  >({
    isOpen: false,
    state: null,
  })

  const currentFill = '#F4EEFF'
  const currentStroke = '#DAC5FF'
  const currentHoverAndPressedFill = '#DDC9FF'

  const eventsFromState = useMemo(() => {
    const stateWithEvents = events.reduce(
      (acc, event) => {
        const state = event.data.state
        acc[state] = (acc[state] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return stateWithEvents
  }, [events])

  const eventsFromStateKeys = Object.keys(eventsFromState)

  const markers: MapMarker[] = useMemo(() => {
    const result: MapMarker[] = []

    eventsFromStateKeys.forEach(state => {
      const coordinates = EVENT_MAP_STATE_COORDS[state as keyof typeof EVENT_MAP_STATE_COORDS]

      const marker: MapMarker = {
        id: state,
        name: state,
        coordinates,
        eventsInStateMarker: eventsFromState[state],
        eventState: state,
      }

      result.push(marker)
    })

    return result
  }, [eventsFromStateKeys, eventsFromState])

  const handleActionMouseHover = useCallback(
    (geo: any, event: MouseEvent<SVGElement>) => {
      event.stopPropagation()

      const actionBoundingClientRect = event.currentTarget.getBoundingClientRect()
      const actionPosition = {
        x: actionBoundingClientRect.left + actionBoundingClientRect.width / 2,
        y: actionBoundingClientRect.top + actionBoundingClientRect.height / 2,
      }

      const stateCode = getUSStateCodeFromStateName(geo.properties.name)
      const eventsInState = eventsFromState[stateCode ?? ''] ?? 0

      setTooltipMessage(
        eventsFromState[stateCode ?? '']
          ? `${eventsInState} ${pluralize({ count: eventsInState, singular: 'event' })} in ${geo.properties.name}`
          : null,
      )
      setMousePosition(actionPosition)
    },
    [eventsFromState],
  )

  const handleActionMouseLeave = useCallback((event?: MouseEvent<SVGElement>) => {
    event?.stopPropagation()
    setMousePosition(null)
    setTooltipMessage(null)
  }, [])

  return (
    <>
      <ComposableMap projection="geoAlbersUsa" viewBox="-20 40 850 550">
        <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
          {({ geographies }) => (
            <>
              {geographies.map(geo => {
                const stateCodeFromState = getUSStateCodeFromStateName(geo.properties.name)
                const stateHasEvents = eventsFromStateKeys.includes(stateCodeFromState ?? '')

                return (
                  <Geography
                    geography={geo}
                    key={geo.rsmKey}
                    onClick={() => {
                      if (!stateHasEvents) return

                      const stateCode = getUSStateCodeFromStateName(geo.properties.name)

                      setStateDialogProps({
                        isOpen: true,
                        state: stateCode
                          ? {
                              code: stateCode,
                              name: geo.properties.name,
                            }
                          : null,
                      })
                    }}
                    onMouseMove={event => handleActionMouseHover(geo, event)}
                    onMouseOut={handleActionMouseLeave}
                    stroke="#FFF"
                    style={{
                      default: {
                        fill: currentFill,
                        stroke: currentStroke,
                        strokeWidth: '0.777px',
                        outline: 'none',
                        transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                      },
                      hover: {
                        fill: currentHoverAndPressedFill,
                        outline: 'none',
                        stroke: currentStroke,
                        strokeWidth: '0.777px',
                        cursor: stateHasEvents ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: currentHoverAndPressedFill,
                        outline: 'none',
                        stroke: currentStroke,
                        strokeWidth: '0.777px',
                        cursor: stateHasEvents ? 'pointer' : 'default',
                      },
                    }}
                  />
                )
              })}
              <AnimatePresence>
                {markers.map(({ id, coordinates, eventsInStateMarker, eventState }) => (
                  <motion.g
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    initial={{ opacity: 0, scale: 0.3 }}
                    key={id}
                    onClick={() =>
                      setStateDialogProps({
                        isOpen: true,
                        state: { code: eventState, name: getUSStateNameFromStateCode(eventState) },
                      })
                    }
                    transition={{ duration: 0.5 }}
                  >
                    <Marker coordinates={coordinates}>
                      <svg
                        className={cn(
                          'cursor-pointer',
                          eventState !== 'DC' && 'pointer-events-none',
                        )}
                        fill="none"
                        height={24}
                        width={24}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={12} cy={12} fill="#6100FF" r="50%" />
                        <text
                          dominantBaseline="central"
                          fill="#FFF"
                          fontFamily="var(--font-satoshi)"
                          fontSize={10}
                          textAnchor="middle"
                          x="50%"
                          y="50%"
                        >
                          {eventsInStateMarker}
                        </text>
                      </svg>
                    </Marker>
                  </motion.g>
                ))}
              </AnimatePresence>
            </>
          )}
        </Geographies>
      </ComposableMap>
      <InfoTooltip
        actionInfo={tooltipMessage}
        handleClearPressedState={handleActionMouseLeave}
        mousePosition={mousePosition}
      />

      <StateEventsDialog
        events={events}
        isOpen={stateDialogProps.isOpen}
        setIsOpen={(open: boolean) => setStateDialogProps({ isOpen: open, state: null })}
        state={stateDialogProps.state}
      />
    </>
  )
}

function InfoTooltip({
  mousePosition,
  actionInfo,
  handleClearPressedState,
}: {
  mousePosition: { x: number; y: number } | null
  actionInfo: string | null
  handleClearPressedState: () => void
}) {
  useEffect(() => {
    const handleInteraction = () => {
      handleClearPressedState()
    }

    window.addEventListener('scroll', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    window.addEventListener('touchmove', handleInteraction)

    return () => {
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('touchmove', handleInteraction)
    }
  }, [handleClearPressedState])

  if (!mousePosition || !actionInfo) return null

  const tooltipWidth = actionInfo.length * 8
  const offsetX = tooltipWidth / 2

  // Calculate the adjusted position so it does not overflow the window
  const centeredX = mousePosition.x - offsetX
  const adjustedX = Math.min(Math.max(centeredX, 0), window.innerWidth - tooltipWidth)

  return (
    <div
      className={`pointer-events-none fixed z-50 flex h-[81px] flex-col items-center  justify-center gap-2 rounded-2xl bg-black px-4 py-2 font-sans text-base text-white`}
      style={{
        top: mousePosition.y,
        left: adjustedX,
        transform: 'translate(0, -125%)',
        pointerEvents: 'none',
      }}
    >
      {actionInfo}
      <span className="font-mono text-sm font-normal">Click state to view</span>
    </div>
  )
}
