'use client'

import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { AnimatePresence, motion } from 'framer-motion'

import {
  ADVOCATES_HEATMAP_GEO_URL,
  STATE_COORDS,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { StateEventsDialog } from '@/components/app/pageEvents/components/stateEventsDialog'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { pluralize } from '@/utils/shared/pluralize'
import {
  getUSStateCodeFromStateName,
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/usStateUtils'

export interface MapMarker {
  id: string
  name: string
  coordinates: [number, number]
}

export function EventsMap({ events }: { events: SWCEvents }) {
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [stateDialogProps, setStateDialogProps] = useState<{ open: boolean; state: string | null }>(
    { open: false, state: null },
  )

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
      const coordinates = STATE_COORDS[state as keyof typeof STATE_COORDS]

      for (let i = 0; i < eventsFromState[state]; i++) {
        const offsetX = i % 2 === 0 ? 1 : -1
        const offsetY = i % 2 === 0 ? -1 : 1

        const offsetCoordinates: [number, number] =
          i === 0
            ? [coordinates[0], coordinates[1]]
            : [coordinates[0] + offsetX, coordinates[1] + offsetY]

        const marker: MapMarker = {
          id: `${state} ${i}`,
          name: `${state} ${i}`,
          coordinates: offsetCoordinates,
        }

        result.push(marker)
      }
    })

    return result
  }, [eventsFromState, eventsFromStateKeys])

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

                      setStateDialogProps({
                        open: true,
                        state: getUSStateCodeFromStateName(geo.properties.name) ?? null,
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
                {markers.map(({ id, coordinates }) => (
                  <motion.g
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    initial={{ opacity: 0, scale: 0.3 }}
                    key={id}
                    transition={{ duration: 0.5 }}
                  >
                    <Marker coordinates={coordinates}>
                      <svg
                        className="pointer-events-none"
                        fill="none"
                        height="11"
                        viewBox="0 0 11 11"
                        width="11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="5.48136"
                          cy="5.8336"
                          fill="#6100FF"
                          rx="4.96232"
                          ry="4.96641"
                        />
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
        isOpen={stateDialogProps.open}
        setIsOpen={(open: boolean) => setStateDialogProps({ open, state: null })}
        state={stateDialogProps.state as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP}
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
