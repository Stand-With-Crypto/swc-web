'use client'

import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { isNil } from 'lodash-es'
import { useRouter } from 'next/navigation'

import { ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/pageAdvocatesHeatmap/constants'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { useApiDecisionDeskCongressData } from '@/hooks/useApiDecisionDeskCongressData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLocale } from '@/hooks/useLocale'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  getUSStateCodeFromStateName,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

interface LiveResultsMapProps {
  initialRaceData: GetAllCongressDataResponse
  locale: SupportedLocale
}

export function LiveResultsMap(props: LiveResultsMapProps) {
  const { initialRaceData, locale } = props

  const urls = getIntlUrls(locale)
  const router = useRouter()

  const { data: liveResultData } = useApiDecisionDeskCongressData(initialRaceData)

  const proCryptoStates = useMemo<Record<string, number>>(() => {
    if (!liveResultData) return {}

    const candidates = [
      ...(liveResultData.senateDataWithDtsi?.candidatesWithVotes || []),
      ...(liveResultData.houseDataWithDtsi?.candidatesWithVotes || []),
    ]

    const statesMap = candidates.reduce(
      (acc, candidate) => {
        const stanceScore =
          candidate.dtsiData?.manuallyOverriddenStanceScore ||
          candidate.dtsiData?.computedStanceScore
        const state = candidate.dtsiData?.primaryRole?.primaryState as USStateCode
        const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[state]

        if (isNil(stanceScore) || isNil(stateName)) return acc

        if (stanceScore > 50 && candidate.elected) {
          acc[stateName] = (acc[stateName] || 0) + 1
        }

        return acc
      },
      {} as Record<string, number>,
    )

    return statesMap
  }, [liveResultData])

  const getTotalElectedCandidatesByState = useCallback(
    (stateName: string) => {
      return proCryptoStates[stateName] || 0
    },
    [proCryptoStates],
  )

  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const handleStateMouseHover = useCallback(
    (geo: any, event: MouseEvent<SVGPathElement>) => {
      const { clientX, clientY } = event
      setMousePosition({ x: clientX, y: clientY })
      setHoveredStateName(geo.properties.name)

      const stateCode = getUSStateCodeFromStateName(geo.properties.name)
      if (stateCode) {
        router.prefetch(urls.locationStateSpecific(stateCode))
      }
    },
    [router, urls],
  )

  const handleStateMouseOut = useCallback(() => {
    setHoveredStateName(null)
  }, [])

  const handleClearPressedState = () => {
    setMousePosition(null)
    setHoveredStateName(null)
  }

  const handleStateClick = useCallback(
    (geo: any) => {
      const stateCode = getUSStateCodeFromStateName(geo.properties.name)
      if (!stateCode) return
      router.push(urls.locationStateSpecific(stateCode))
    },
    [router, urls],
  )

  const isMobile = useIsMobile()
  if (isMobile) return null

  return (
    <div className="relative h-full w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
        viewBox="-20 40 850 550"
      >
        <Geographies geography={ADVOCATES_HEATMAP_GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                cursor="pointer"
                geography={geo}
                key={geo.rsmKey}
                onClick={_event => handleStateClick(geo)}
                onMouseMove={event => handleStateMouseHover(geo, event)}
                onMouseOut={handleStateMouseOut}
                stroke="#FFF"
                style={{
                  default: {
                    fill: proCryptoStates[geo.properties.name] ? '#6200FF' : '#F4EEFF',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                    outline: 'none',
                    transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                    cursor: 'pointer',
                  },
                  hover: {
                    fill: proCryptoStates[geo.properties.name] ? '#7620FF' : '#DDC9FF',
                    outline: 'none',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                    transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                    cursor: 'pointer',
                  },
                  pressed: {
                    fill: '#DDC9FF',
                    outline: 'none',
                    stroke: '#DAC5FF',
                    strokeWidth: '0.777px',
                    cursor: 'pointer',
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      <Tooltip
        getTotalElectedCandidatesByState={getTotalElectedCandidatesByState}
        handleClearPressedState={handleClearPressedState}
        hoveredStateName={hoveredStateName}
        mousePosition={mousePosition}
      />
    </div>
  )
}

function Tooltip({
  getTotalElectedCandidatesByState,
  hoveredStateName,
  mousePosition,
  handleClearPressedState,
}: {
  hoveredStateName: string | null
  mousePosition: { x: number; y: number } | null
  handleClearPressedState: () => void
  getTotalElectedCandidatesByState: (stateName: string) => number
}) {
  const locale = useLocale()

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

  if (!mousePosition || !hoveredStateName) return null

  const totalElectedCandidates = getTotalElectedCandidatesByState(hoveredStateName)

  const proCryptoPoliticianText = totalElectedCandidates === 1 ? 'politician' : 'politicians'

  const formattedNumber = !totalElectedCandidates
    ? `View race in ${hoveredStateName}`
    : `${FormattedNumber({ amount: totalElectedCandidates, locale })} pro-crypto ${proCryptoPoliticianText} elected in ${hoveredStateName}`

  const tooltipWidth = formattedNumber.length * (!totalElectedCandidates ? 10 : 8)
  const offsetX = tooltipWidth / 2

  const centeredX = mousePosition.x - offsetX
  const adjustedX = Math.min(Math.max(centeredX, 0), window.innerWidth - tooltipWidth)

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black p-4 font-sans text-base text-white',
      )}
      style={{
        top: mousePosition.y,
        left: adjustedX,
        transform: 'translate(0, -125%)',
        pointerEvents: 'none',
      }}
    >
      <p>{formattedNumber}</p>
      <p className="text-base font-light text-fontcolor-muted">Click state to view</p>
    </div>
  )
}
