'use client'

import { FC, MouseEvent, useCallback, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useMedia, useOrientation } from 'react-use'
import { AnimatePresence } from 'motion/react'

import { AdvocateHeatmapActionList } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionList'
import { ActionInfoTooltip } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionTooltip'
import { IconProps } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'
import { AdvocateHeatmapMarker } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapMarker'
import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapOdometer'
import { TotalAdvocatesPerStateTooltip } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapTooltip'
import { ADVOCATES_HEATMAP_GEO_URL } from '@/components/app/pageAdvocatesHeatmap/constants'
import { MapMarker, useAdvocateMap } from '@/components/app/pageAdvocatesHeatmap/useAdvocateMap'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getUSStateCodeFromStateName } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface RenderMapProps {
  countryCode: SupportedCountryCodes
  actions: PublicRecentActivity
  countUsers: number
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  isEmbedded?: boolean
}

export function AdvocatesHeatmap({
  countryCode,
  actions,
  countUsers,
  advocatesMapPageData,
  isEmbedded,
}: RenderMapProps) {
  const orientation = useOrientation()
  const isShort = useMedia('(max-height: 430px)', true)
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData)
  const markers = useAdvocateMap(actions)

  const isMobileLandscape = orientation.type.includes('landscape') && isShort

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

  if (advocatesPerState.isLoading || !actions) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-start py-6',
          isEmbedded
            ? 'px-2'
            : `rounded-[40px] bg-[#FBF8FF] px-12 ${isMobileLandscape ? 'py-8' : 'py-28'}`,
        )}
      >
        <div className="flex h-full w-full flex-col items-center gap-4 md:flex-row">
          <Skeleton
            childrenClassName="visible"
            className="flex h-[769px] w-full items-center justify-center bg-transparent"
          >
            <NextImage
              alt="Stand With Crypto Logo"
              height={120}
              priority
              src="/logo/shield.svg"
              width={121}
            />
          </Skeleton>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-start px-2 py-6', isEmbedded ? '' : 'gap-8')}>
      <div
        className={cn(
          'flex w-full flex-col items-start gap-4',
          isEmbedded
            ? 'md:flex-row'
            : `md:flex-column rounded-[40px] bg-[#FBF8FF] px-12 ${isMobileLandscape ? 'py-8' : 'py-20'}`,
        )}
      >
        {isEmbedded && <AdvocateHeatmapActionList isEmbedded={isEmbedded} />}
        <MapComponent
          countryCode={countryCode}
          handleStateMouseHover={handleStateMouseHover}
          handleStateMouseOut={handleStateMouseOut}
          isEmbedded={isEmbedded}
          markers={markers}
        />
        <TotalAdvocatesPerStateTooltip
          countryCode={countryCode}
          getTotalAdvocatesPerState={getTotalAdvocatesPerState}
          handleClearPressedState={handleClearPressedState}
          hoveredStateName={hoveredStateName}
          mousePosition={mousePosition}
        />
      </div>
      <div className="mt-2 flex w-full items-center justify-end">
        {isEmbedded ? (
          <AdvocateHeatmapOdometer
            className={cn(
              'font-sans',
              isEmbedded ? 'bg-black text-white' : 'bg-inherit text-black',
            )}
            countUsers={countUsers}
            countryCode={countryCode}
          />
        ) : (
          <AdvocateHeatmapActionList isEmbedded={isEmbedded} />
        )}
      </div>
    </div>
  )
}

const MapComponent = ({
  markers,
  handleStateMouseHover,
  handleStateMouseOut,
  countryCode,
  isEmbedded,
}: {
  markers: MapMarker[]
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  countryCode: SupportedCountryCodes
  isEmbedded?: boolean
}) => {
  const [actionInfo, setActionInfo] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const currentFill = isEmbedded ? '#171717' : '#F4EEFF'
  const currentStroke = isEmbedded ? '#3A3B3D' : '#DAC5FF'
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
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
        viewBox="-20 40 850 550"
      >
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
                      strokeWidth: '0.777px',
                      outline: 'none',
                      transition: 'fill 0.2s ease-in-out, stroke 0.2s ease-in-out',
                    },
                    hover: {
                      fill: currentHoverAndPressedFill,
                      outline: 'none',
                      stroke: currentStroke,
                      strokeWidth: '0.777px',
                    },
                    pressed: {
                      fill: currentHoverAndPressedFill,
                      outline: 'none',
                      stroke: currentStroke,
                      strokeWidth: '0.777px',
                    },
                  }}
                />
              ))}
              <AnimatePresence>
                {markers.map(({ id, name, coordinates, actionType, iconType, amountUsd }) => {
                  const currentAmountUsd = amountUsd
                    ? FormattedCurrency({
                        amount: amountUsd,
                        locale: COUNTRY_CODE_TO_LOCALE[countryCode],
                        currencyCode: SupportedFiatCurrencyCodes.USD,
                      })
                    : ''
                  const currentActionInfo = `Someone in ${name} ${iconType?.labelActionTooltip(currentAmountUsd) ?? ''}`
                  const IconComponent = iconType?.icon as FC<IconProps>
                  const markerKey = `${name}-${actionType}-${id}`

                  return (
                    <AdvocateHeatmapMarker
                      IconComponent={IconComponent}
                      coordinates={coordinates}
                      currentActionInfo={currentActionInfo}
                      handleActionMouseLeave={handleActionMouseLeave}
                      handleActionMouseOver={handleActionMouseOver}
                      key={markerKey}
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
