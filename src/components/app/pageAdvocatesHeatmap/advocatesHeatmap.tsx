'use client'

import { FC, MouseEvent, useCallback, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useMedia, useOrientation } from 'react-use'
import { Settings } from 'lucide-react'
import { AnimatePresence } from 'motion/react'

import { AdvocateHeatmapActionList } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionList'
import { ActionInfoTooltip } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapActionTooltip'
import { IconProps } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'
import { AdvocateHeatmapMarker } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapMarker'
import { AdvocateHeatmapOdometer } from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapOdometer'
import { TotalAdvocatesPerStateTooltip } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapTooltip'
import {
  AREA_COORDS_BY_COUNTRY_CODE,
  AreaCoordinates,
  AreaCoordinatesKey,
  type MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { MapDebugger } from '@/components/app/pageAdvocatesHeatmap/debugger'
import { useMockedAdvocateMap } from '@/components/app/pageAdvocatesHeatmap/debugger/useMockedAdvocateMap'
import { MapMarker, useAdvocateMap } from '@/components/app/pageAdvocatesHeatmap/useAdvocateMap'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { getUSStateCodeFromStateName } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface RenderMapProps {
  countryCode: SupportedCountryCodes
  actions: PublicRecentActivity
  countUsers: number
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  isEmbedded?: boolean
  mapConfig: MapProjectionConfig
}

const isProd = NEXT_PUBLIC_ENVIRONMENT === 'production'

export function AdvocatesHeatmap({
  countryCode,
  actions,
  countUsers,
  advocatesMapPageData,
  isEmbedded,
  mapConfig,
}: RenderMapProps) {
  const [mockedCoordinates, setMockedCoordinates] = useState<AreaCoordinates>({
    ...AREA_COORDS_BY_COUNTRY_CODE[countryCode],
  })
  const [mockedSelectedAreas, setMockedSelectedAreas] = useState<AreaCoordinatesKey[]>(
    Object.keys(mockedCoordinates) as AreaCoordinatesKey[],
  )
  const [mockedActionsLimit, setMockedActionsLimit] = useState(20)

  const [isMockMode, setIsMockMode] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const orientation = useOrientation()
  const isShort = useMedia('(max-height: 430px)', true)
  const advocatesPerState = useApiAdvocateMap(advocatesMapPageData)

  const mockedMarkers = useMockedAdvocateMap({
    mapConfig,
    coordinates: mockedCoordinates,
    selectedAreas: mockedSelectedAreas,
    actionsLimit: mockedActionsLimit,
  })
  const markers = useAdvocateMap({ actions, mapConfig })

  const isMobileLandscape = orientation.type.includes('landscape') && isShort

  const totalAdvocatesPerState = advocatesPerState.data.advocatesMapData.totalAdvocatesPerState

  const getTotalAdvocatesPerState = useCallback(
    (stateName: string) => {
      if (countryCode === SupportedCountryCodes.US) {
        const stateCode = getUSStateCodeFromStateName(stateName)
        return totalAdvocatesPerState.find(total => total.state === stateCode)?.totalAdvocates
      }
      if (countryCode === SupportedCountryCodes.GB) {
        return totalAdvocatesPerState.find(
          total => total.state.toUpperCase() === stateName.toUpperCase(),
        )?.totalAdvocates
      }
    },
    [countryCode, totalAdvocatesPerState],
  )

  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const handleStateMouseHover = useCallback(
    (geo: any, event: MouseEvent<SVGPathElement>) => {
      const stateName = geo.properties[mapConfig.geoPropertyStateNameKey]

      const { clientX, clientY } = event
      setMousePosition({ x: clientX, y: clientY })
      setHoveredStateName(stateName)
    },
    [mapConfig],
  )

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
    <div className={cn('flex flex-col items-start', isEmbedded ? '' : 'gap-8')}>
      <div
        className={cn(
          'flex w-full flex-col items-start gap-4',
          isEmbedded
            ? 'md:flex-row'
            : `md:flex-column rounded-[40px] bg-[#FBF8FF] px-12 ${isMobileLandscape ? 'py-8' : 'py-10'}`,
        )}
      >
        {isEmbedded && (
          <AdvocateHeatmapActionList countryCode={countryCode} isEmbedded={isEmbedded} />
        )}
        <div className="relative w-full">
          {!isProd && (
            <Button
              className="absolute right-2 top-2 z-10 bg-yellow-500 text-black hover:bg-yellow-600"
              onClick={() => setIsEditorOpen(true)}
              size="sm"
              variant="default"
            >
              <Settings className="mr-2 h-4 w-4" />
              Debugger
            </Button>
          )}
          <MapComponent
            countryCode={countryCode}
            handleStateMouseHover={handleStateMouseHover}
            handleStateMouseOut={handleStateMouseOut}
            isEmbedded={isEmbedded}
            mapConfig={mapConfig}
            markers={isMockMode ? mockedMarkers : markers}
          />
        </div>
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
          <AdvocateHeatmapActionList countryCode={countryCode} isEmbedded={isEmbedded} />
        )}
      </div>

      {!isProd && (
        <MapDebugger
          actionsLimit={mockedActionsLimit}
          coordinates={mockedCoordinates}
          isMockMode={isMockMode}
          isOpen={isEditorOpen}
          onActionsLimitChange={setMockedActionsLimit}
          onAreasChange={setMockedSelectedAreas}
          onClose={() => setIsEditorOpen(false)}
          onMockModeChange={setIsMockMode}
          onSaveCoordinates={setMockedCoordinates}
          selectedAreas={mockedSelectedAreas}
        />
      )}
    </div>
  )
}

const MapComponent = ({
  markers,
  handleStateMouseHover,
  handleStateMouseOut,
  countryCode,
  isEmbedded,
  mapConfig,
}: {
  markers: MapMarker[]
  handleStateMouseHover: (geo: any, event: MouseEvent<SVGPathElement>) => void
  handleStateMouseOut: () => void
  countryCode: SupportedCountryCodes
  isEmbedded?: boolean
  mapConfig: MapProjectionConfig
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
        projection={mapConfig.projection}
        projectionConfig={mapConfig.projectionConfig}
        style={{ width: '100%', height: '100%' }}
        viewBox="-20 40 850 550"
      >
        <Geographies geography={mapConfig.projectionUrl}>
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
                      size={mapConfig.markerSize}
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
